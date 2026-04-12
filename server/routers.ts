import { COOKIE_NAME } from "@shared/const";
import { signLocalSession } from "./_core/localAuth";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, adminProcedure } from "./_core/trpc";
import { z } from "zod";
import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllBanners,
  createBanner,
  deleteBanner,
  getSetting,
  setSetting,
  getAllSettings,
} from "./db";
import { nanoid } from "nanoid";

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const productInput = z.object({
  name: z.string().min(1),
  description: z.string().optional().default(""),
  priceEUR: z.number().int().min(0),
  priceTRY: z.number().int().min(0),
  imageUrl: z.string().optional().default(""),
  imageUrls: z.array(z.string()).optional().default([]),
  mainCategory: z.string().optional().default(""),
  subCategory: z.string().optional().default(""),
  productCode: z.string().optional().default(""),
  colorCode: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
});

const bannerInput = z.object({
  imageUrl: z.string().min(1),
  title: z.string().optional(),
  link: z.string().optional(),
  sortOrder: z.number().int().optional().default(0),
});

const contactInfoSchema = z.object({
  address: z.string(),
  phone: z.string(),
  email: z.string(),
  mapUrl: z.string(),
  instagramUrl: z.string(),
  whatsappNumber: z.string(),
  telegramUrl: z.string(),
  facebookUrl: z.string(),
});

const aboutInfoSchema = z.object({
  title: z.string(),
  content: z.string(),
  imageUrl: z.string().optional(),
});

// ─── Router ─────────────────────────────────────────────────────────────────

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),

    login: publicProcedure
      .input(z.object({ email: z.string().min(1), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");

        const result = await db
          .select()
          .from(users)
          .where(eq(users.email, input.email.toLowerCase().trim()))
          .limit(1);

        const user = result[0];
        if (!user || !user.passwordHash) {
          throw new Error("E-posta veya şifre hatalı.");
        }

        const match = await bcrypt.compare(input.password, user.passwordHash);
        if (!match) throw new Error("E-posta veya şifre hatalı.");

        if (user.role !== "admin") {
          throw new Error("Bu hesabın yönetici yetkisi bulunmuyor.");
        }

        const ONE_YEAR_MS = 365 * 24 * 60 * 60 * 1000;
        const token = await signLocalSession(user.openId, user.name ?? user.email ?? "");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        return { success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
      }),

    setAdminPassword: adminProcedure
      .input(z.object({ newPassword: z.string().min(6) }))
      .mutation(async ({ input, ctx }) => {
        const db = await getDb();
        if (!db) throw new Error("Veritabanı bağlantısı kurulamadı.");
        const hash = await bcrypt.hash(input.newPassword, 12);
        await db.update(users).set({ passwordHash: hash }).where(eq(users.id, ctx.user.id));
        return { success: true };
      }),
  }),

  // ─── Products ─────────────────────────────────────────────────────────────
  products: router({
    list: publicProcedure.query(async () => {
      return getAllProducts();
    }),

    byId: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(async ({ input }) => {
        return getProductById(input.id);
      }),

    create: adminProcedure
      .input(productInput)
      .mutation(async ({ input }) => {
        const id = nanoid();
        const now = Date.now();
        await createProduct({
          id,
          ...input,
          imageUrl: input.imageUrl ?? null,
          imageUrls: input.imageUrls ?? [],
          mainCategory: input.mainCategory ?? null,
          subCategory: input.subCategory ?? null,
          productCode: input.productCode ?? null,
          colorCode: input.colorCode ?? null,
          videoUrl: input.videoUrl ?? null,
          createdAt: now,
        });
        return { id };
      }),

    update: adminProcedure
      .input(z.object({ id: z.string() }).merge(productInput.partial()))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await updateProduct(id, data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteProduct(input.id);
        return { success: true };
      }),
  }),

  // ─── Banners ──────────────────────────────────────────────────────────────
  banners: router({
    list: publicProcedure.query(async () => {
      return getAllBanners();
    }),

    create: adminProcedure
      .input(bannerInput)
      .mutation(async ({ input }) => {
        const id = nanoid();
        await createBanner({ id, ...input });
        return { id };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input }) => {
        await deleteBanner(input.id);
        return { success: true };
      }),
  }),

  // ─── Settings ─────────────────────────────────────────────────────────────
  settings: router({
    getAll: publicProcedure.query(async () => {
      return getAllSettings();
    }),

    get: publicProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return getSetting(input.key);
      }),

    set: adminProcedure
      .input(z.object({ key: z.string(), value: z.unknown() }))
      .mutation(async ({ input }) => {
        await setSetting(input.key, input.value);
        return { success: true };
      }),

    setContactInfo: adminProcedure
      .input(contactInfoSchema)
      .mutation(async ({ input }) => {
        await setSetting("contactInfo", input);
        return { success: true };
      }),

    setAboutInfo: adminProcedure
      .input(aboutInfoSchema)
      .mutation(async ({ input }) => {
        await setSetting("aboutInfo", input);
        return { success: true };
      }),

    setMainCategories: adminProcedure
      .input(z.object({ categories: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        await setSetting("mainCategories", input.categories);
        return { success: true };
      }),

    setSubCategories: adminProcedure
      .input(z.object({ categories: z.array(z.string()) }))
      .mutation(async ({ input }) => {
        await setSetting("subCategories", input.categories);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
