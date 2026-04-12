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

// Video upload: bellekte tut, S3'e yükleyeceğiz
const videoUpload = multer({
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

// Image upload: bellekte tut, S3'e yükleyeceğiz
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB per image
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Sadece görsel dosyaları yüklenebilir."));
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
  // POST /api/upload/image — admin only, multipart/form-data (multiple images)
  app.post(
    "/api/upload/image",
    imageUpload.array("images", 4),
    async (req: Request, res: Response) => {
      try {
        const user = await getAdminUser(req);
        if (!user || user.role !== "admin") {
          res.status(403).json({ error: "Yetkisiz erişim. Sadece adminler görsel yükleyebilir." });
          return;
        }

        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) {
          res.status(400).json({ error: "Görsel dosyası bulunamadı." });
          return;
        }

        const urls: string[] = [];
        for (const file of files) {
          const ext = file.originalname.split(".").pop() || "jpg";
          const key = `images/${nanoid()}.${ext}`;
          const { url } = await storagePut(key, file.buffer, file.mimetype);
          urls.push(url);
        }

        res.json({ urls });
      } catch (err: unknown) {
        console.error("[Upload] Görsel yükleme hatası:", err);
        const message = err instanceof Error ? err.message : "Bilinmeyen hata";
        res.status(500).json({ error: `Görsel yüklenemedi: ${message}` });
      }
    }
  );

  // POST /api/upload/video — admin only, multipart/form-data
  app.post(
    "/api/upload/video",
    videoUpload.single("video"),
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
