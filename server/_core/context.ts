import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { parseCookies, verifyLocalSession } from "./localAuth";
import { COOKIE_NAME } from "@shared/const";
import { getDb } from "../db";
import { users } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

/**
 * Determine if we are running in self-hosted mode (no Manus OAuth env vars).
 * In self-hosted mode, authentication uses local email+password JWT sessions.
 */
function isSelfHosted(): boolean {
  return !process.env.OAUTH_SERVER_URL || !process.env.VITE_APP_ID;
}

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    if (isSelfHosted()) {
      // ── Self-hosted: verify local JWT session ──────────────────────────────
      const cookies = parseCookies(opts.req.headers.cookie);
      const session = await verifyLocalSession(cookies.get(COOKIE_NAME));
      if (session) {
        const db = await getDb();
        if (db) {
          const result = await db
            .select()
            .from(users)
            .where(eq(users.openId, session.openId))
            .limit(1);
          user = result[0] ?? null;
        }
      }
    } else {
      // ── Manus OAuth: verify Manus session ─────────────────────────────────
      user = await sdk.authenticateRequest(opts.req);
    }
  } catch {
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
