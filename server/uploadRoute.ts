import type { Express, Request, Response } from "express";
import multer from "multer";
import { nanoid } from "nanoid";
import { storagePut } from "./storage";
import { parseCookies, verifyLocalSession } from "./_core/localAuth";
import { sdk } from "./_core/sdk";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { COOKIE_NAME } from "../shared/const";

// Bellekte tut, S3'e yükleyeceğiz
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 200 * 1024 * 1024, // 200 MB
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece video dosyaları yüklenebilir."));
    }
  },
});

function isSelfHosted(): boolean {
  return !process.env.OAUTH_SERVER_URL || !process.env.VITE_APP_ID;
}

async function getAdminUser(req: Request) {
  try {
    if (isSelfHosted()) {
      const cookies = parseCookies(req.headers.cookie);
      const session = await verifyLocalSession(cookies.get(COOKIE_NAME));
      if (!session) return null;
      const db = await getDb();
      if (!db) return null;
      const result = await db
        .select()
        .from(users)
        .where(eq(users.openId, session.openId))
        .limit(1);
      return result[0] ?? null;
    } else {
      return await sdk.authenticateRequest(req);
    }
  } catch {
    return null;
  }
}

export function registerUploadRoutes(app: Express) {
  // POST /api/upload/video — admin only, multipart/form-data
  app.post(
    "/api/upload/video",
    upload.single("video"),
    async (req: Request, res: Response) => {
      try {
        // Yetki kontrolü
        const user = await getAdminUser(req);
        if (!user || user.role !== "admin") {
          res.status(403).json({ error: "Yetkisiz erişim. Sadece adminler video yükleyebilir." });
          return;
        }

        if (!req.file) {
          res.status(400).json({ error: "Video dosyası bulunamadı." });
          return;
        }

        const file = req.file;
        const ext = file.originalname.split(".").pop() || "mp4";
        const key = `videos/${nanoid()}.${ext}`;

        const { url } = await storagePut(key, file.buffer, file.mimetype);

        res.json({ url, key });
      } catch (err: unknown) {
        console.error("[Upload] Video yükleme hatası:", err);
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        res.status(500).json({ error: `Video yüklenemedi: ${message}` });
      }
    }
  );
}
