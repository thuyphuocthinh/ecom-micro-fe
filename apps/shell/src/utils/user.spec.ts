import { describe, it, expect } from "vitest";
import {
  getUserDisplayName,
  getUserInitial,
  getUserAvatarInfo,
} from "./user.ts";

describe("getUserDisplayName", () => {
  it("returns displayName when available", () => {
    expect(
      getUserDisplayName({ displayName: "Nguyễn Văn A", email: "a@ecom.vn" }),
    ).toBe("Nguyễn Văn A");
  });

  it("returns email prefix when displayName is missing", () => {
    expect(getUserDisplayName({ email: "customer@ecom.vn" })).toBe("customer");
    expect(
      getUserDisplayName({ displayName: "", email: "user.test@ecom.vn" }),
    ).toBe("user.test");
  });

  it("returns default 'Tài khoản' when user is null or empty", () => {
    expect(getUserDisplayName(null)).toBe("Tài khoản");
    expect(getUserDisplayName(undefined)).toBe("Tài khoản");
    expect(getUserDisplayName({})).toBe("Tài khoản");
  });
});

describe("getUserInitial", () => {
  it("extracts the first letter of the last word for Vietnamese names", () => {
    expect(getUserInitial({ displayName: "Nguyễn Văn An" })).toBe("A");
    expect(getUserInitial({ displayName: "Trần Bảo Bình" })).toBe("B");
    expect(getUserInitial({ displayName: "John Doe" })).toBe("D");
  });

  it("extracts from single word name or email prefix", () => {
    expect(getUserInitial({ displayName: "Admin" })).toBe("A");
    expect(getUserInitial({ email: "minh@ecom.vn" })).toBe("M");
  });

  it("returns uppercase 'U' fallback when empty", () => {
    expect(getUserInitial(null)).toBe("U");
  });
});

describe("getUserAvatarInfo", () => {
  it("detects custom avatar when avatarUrl is present", () => {
    const info = getUserAvatarInfo({
      displayName: "Thịnh Nguyễn",
      email: "thinh@ecom.vn",
      avatarUrl: "https://example.com/avatar.jpg",
    });

    expect(info.hasCustomAvatar).toBe(true);
    expect(info.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(info.initial).toBe("N");
    expect(info.displayName).toBe("Thịnh Nguyễn");
  });

  it("falls back to initial when avatarUrl is missing or empty", () => {
    const info = getUserAvatarInfo({
      displayName: "Nguyễn Văn A",
      email: "a@ecom.vn",
      avatarUrl: null,
    });

    expect(info.hasCustomAvatar).toBe(false);
    expect(info.avatarUrl).toBeNull();
    expect(info.initial).toBe("A");
  });
});
