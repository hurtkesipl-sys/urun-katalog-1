import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock the database module
vi.mock("./db", () => ({
  getDb: vi.fn().mockResolvedValue(null),
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  getAllProducts: vi.fn().mockResolvedValue([]),
  getProductById: vi.fn().mockResolvedValue(undefined),
  createProduct: vi.fn().mockResolvedValue(undefined),
  updateProduct: vi.fn().mockResolvedValue(undefined),
  deleteProduct: vi.fn().mockResolvedValue(undefined),
  getAllBanners: vi.fn().mockResolvedValue([]),
  createBanner: vi.fn().mockResolvedValue(undefined),
  deleteBanner: vi.fn().mockResolvedValue(undefined),
  getSetting: vi.fn().mockResolvedValue(null),
  getAllSettings: vi.fn().mockResolvedValue({}),
  setSetting: vi.fn().mockResolvedValue(undefined),
}));

function createAdminContext(): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "admin-user",
      email: "admin@example.com",
      name: "Admin User",
      loginMethod: "manus",
      role: "admin",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
}

describe("products router", () => {
  it("list returns an array (public access)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("create requires admin role", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.products.create({
        name: "Test",
        description: "",
        priceEUR: 50,
        priceTRY: 1750,
        imageUrl: "https://example.com/img.jpg",
        imageUrls: [],
        mainCategory: "İpek",
        subCategory: "Elbise",
        productCode: "TST-001",
        colorCode: "#000000",
        videoUrl: "",
      })
    ).rejects.toThrow();
  });

  it("create succeeds for admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.products.create({
      name: "Test Ürün",
      description: "Test açıklama",
      priceEUR: 50,
      priceTRY: 1750,
      imageUrl: "https://example.com/img.jpg",
      imageUrls: [],
      mainCategory: "İpek",
      subCategory: "Elbise",
      productCode: "TST-001",
      colorCode: "#000000",
      videoUrl: "",
    });
    // create returns { id } - the new product's ID
    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe("string");
  });
});

describe("settings router", () => {
  it("getAll returns an object (public access)", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.settings.getAll();
    expect(typeof result).toBe("object");
  });

  it("setContactInfo requires admin role", async () => {
    const ctx = createPublicContext();
    const caller = appRouter.createCaller(ctx);
    await expect(
      caller.settings.setContactInfo({
        address: "Test",
        phone: "123",
        email: "test@test.com",
        mapUrl: "",
        instagramUrl: "",
        whatsappNumber: "",
        telegramUrl: "",
        facebookUrl: "",
      })
    ).rejects.toThrow();
  });
});
