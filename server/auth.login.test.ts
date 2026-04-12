import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import { COOKIE_NAME } from "../shared/const";
import type { TrpcContext } from "./_core/context";

// Mock getDb and bcrypt for unit testing (no real DB needed)
vi.mock("./db", () => ({
  getDb: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    compare: vi.fn(),
    hash: vi.fn(),
  },
}));

vi.mock("./_core/localAuth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./_core/localAuth")>();
  return {
    ...actual,
    signLocalSession: vi.fn().mockResolvedValue("mock-jwt-token"),
  };
});

import { getDb } from "./db";
import bcrypt from "bcryptjs";

type SetCookieCall = { name: string; value: string; options: Record<string, unknown> };

function createPublicContext(): { ctx: TrpcContext; setCookies: SetCookieCall[] } {
  const setCookies: SetCookieCall[] = [];
  const ctx: TrpcContext = {
    user: null,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      cookie: (name: string, value: string, options: Record<string, unknown>) => {
        setCookies.push({ name, value, options });
      },
      clearCookie: vi.fn(),
    } as unknown as TrpcContext["res"],
  };
  return { ctx, setCookies };
}

describe("auth.login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns error when user not found", async () => {
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);

    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "notfound", password: "anypass" })
    ).rejects.toThrow("E-posta veya şifre hatalı.");
  });

  it("returns error when password does not match", async () => {
    const mockUser = {
      id: 1,
      openId: "local_abc",
      email: "welat",
      name: "Welat",
      role: "admin",
      passwordHash: "$2a$12$hashedpassword",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockUser]),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "welat", password: "wrongpass" })
    ).rejects.toThrow("E-posta veya şifre hatalı.");
  });

  it("sets session cookie and returns user on successful login", async () => {
    const mockUser = {
      id: 1,
      openId: "local_abc",
      email: "welat",
      name: "Welat",
      role: "admin",
      passwordHash: "$2a$12$hashedpassword",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockUser]),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const { ctx, setCookies } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.auth.login({ email: "welat", password: "welat1980" }); // username accepted

    expect(result.success).toBe(true);
    expect(result.user.email).toBe("welat");
    expect(result.user.role).toBe("admin");
    expect(setCookies).toHaveLength(1);
    expect(setCookies[0]?.name).toBe(COOKIE_NAME);
    expect(setCookies[0]?.value).toBe("mock-jwt-token");
  });

  it("returns error when user role is not admin", async () => {
    const mockUser = {
      id: 2,
      openId: "local_xyz",
      email: "user@example.com",
      name: "Regular User",
      role: "user",
      passwordHash: "$2a$12$hashedpassword",
      loginMethod: "local",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    };
    const mockDb = {
      select: vi.fn().mockReturnThis(),
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([mockUser]),
    };
    vi.mocked(getDb).mockResolvedValue(mockDb as any);
    vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

    const { ctx } = createPublicContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.auth.login({ email: "user@example.com", password: "pass123" })
    ).rejects.toThrow("Bu hesabın yönetici yetkisi bulunmuyor.");
  });
});
