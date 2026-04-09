import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, bigint } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  /** Hashed password for local (self-hosted) auth. Null when using OAuth. */
  passwordHash: varchar("passwordHash", { length: 256 }),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Products table
 */
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 512 }).notNull(),
  description: text("description"),
  priceEUR: int("priceEUR").notNull().default(0),
  priceTRY: int("priceTRY").notNull().default(0),
  imageUrl: text("imageUrl"),
  imageUrls: json("imageUrls").$type<string[]>(),
  mainCategory: varchar("mainCategory", { length: 128 }),
  subCategory: varchar("subCategory", { length: 128 }),
  productCode: varchar("productCode", { length: 128 }),
  colorCode: varchar("colorCode", { length: 64 }),
  videoUrl: text("videoUrl"),
  createdAt: bigint("createdAt", { mode: "number" }).notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Banners table
 */
export const banners = mysqlTable("banners", {
  id: varchar("id", { length: 64 }).primaryKey(),
  imageUrl: text("imageUrl").notNull(),
  title: varchar("title", { length: 512 }),
  link: varchar("link", { length: 1024 }),
  sortOrder: int("sortOrder").default(0),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;

/**
 * Site settings table (key-value store)
 */
export const siteSettings = mysqlTable("siteSettings", {
  key: varchar("key", { length: 128 }).primaryKey(),
  value: json("value"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
