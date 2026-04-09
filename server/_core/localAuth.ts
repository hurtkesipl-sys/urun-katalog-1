/**
 * Local Authentication System
 * Replaces Manus OAuth for self-hosted deployments.
 * Uses email + password with bcrypt hashing and JWT sessions.
 */
import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookieHeader } from "cookie";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { getSessionCookieOptions } from "./cookies";
import bcrypt from "bcryptjs";

const isNonEmptyString = (v: unknown): v is string =>
  typeof v === "string" && v.length > 0;

function getSecret() {
  const secret = process.env.JWT_SECRET ?? "change-me-in-production";
  return new TextEncoder().encode(secret);
}

export async function signLocalSession(openId: string, name: string): Promise<string> {
  const issuedAt = Date.now();
  const expiresSeconds = Math.floor((issuedAt + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, appId: "local", name })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresSeconds)
    .sign(getSecret());
}

export async function verifyLocalSession(
  cookieValue: string | undefined | null
): Promise<{ openId: string; name: string } | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSecret(), {
      algorithms: ["HS256"],
    });
    const { openId, name } = payload as Record<string, unknown>;
    if (!isNonEmptyString(openId) || !isNonEmptyString(name)) return null;
    return { openId, name };
  } catch {
    return null;
  }
}

export function parseCookies(cookieHeader: string | undefined): Map<string, string> {
  if (!cookieHeader) return new Map();
  return new Map(Object.entries(parseCookieHeader(cookieHeader)));
}

/**
 * Register local auth routes:
 *   POST /api/auth/login   { email, password }
 *   POST /api/auth/logout
 *   GET  /api/auth/me
 */
export function registerLocalAuthRoutes(app: Express) {
  // ─── Login ──────────────────────────────────────────────────────────────────
  app.post("/api/auth/login", async (req: Request, res: Response) => {
    const { email, password } = req.body as { email?: string; password?: string };

    if (!email || !password) {
      res.status(400).json({ error: "E-posta ve şifre zorunludur." });
      return;
    }

    try {
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Veritabanı bağlantısı kurulamadı." });
        return;
      }

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, email.toLowerCase().trim()))
        .limit(1);

      const user = result[0];

      if (!user || !user.passwordHash) {
        res.status(401).json({ error: "E-posta veya şifre hatalı." });
        return;
      }

      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        res.status(401).json({ error: "E-posta veya şifre hatalı." });
        return;
      }

      if (user.role !== "admin") {
        res.status(403).json({ error: "Bu hesabın yönetici yetkisi bulunmuyor." });
        return;
      }

      const sessionToken = await signLocalSession(user.openId, user.name ?? user.email ?? "");
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Login failed:", error);
      res.status(500).json({ error: "Giriş işlemi başarısız." });
    }
  });

  // ─── Logout ─────────────────────────────────────────────────────────────────
  app.post("/api/auth/logout", (req: Request, res: Response) => {
    const cookieOptions = getSessionCookieOptions(req);
    res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    res.json({ success: true });
  });

  // ─── Me ─────────────────────────────────────────────────────────────────────
  app.get("/api/auth/me", async (req: Request, res: Response) => {
    const cookies = parseCookies(req.headers.cookie);
    const session = await verifyLocalSession(cookies.get(COOKIE_NAME));

    if (!session) {
      res.status(401).json({ user: null });
      return;
    }

    try {
      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Veritabanı bağlantısı kurulamadı." });
        return;
      }

      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, session.openId))
        .limit(1);

      const user = result[0];
      if (!user) {
        res.status(401).json({ user: null });
        return;
      }

      res.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error("[LocalAuth] Me failed:", error);
      res.status(500).json({ error: "Kullanıcı bilgisi alınamadı." });
    }
  });
}
