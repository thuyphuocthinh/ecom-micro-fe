import { describe, it, expect } from "vitest";
import {
  emailSchema,
  loginPasswordSchema,
  registerPasswordSchema,
  displayNameSchema,
  termsSchema,
  verifyCodeSchema,
  loginFormSchema,
  registerFormSchema,
  verifyEmailFormSchema,
  forgotPasswordFormSchema,
  resetPasswordFormSchema,
} from "./schemas.ts";

describe("Auth Schemas (AC-10)", () => {
  describe("emailSchema", () => {
    it("rejects empty or whitespace email", () => {
      const res = emailSchema.safeParse("");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Nhập email của bạn.");
      }

      const resSpaces = emailSchema.safeParse("   ");
      expect(resSpaces.success).toBe(false);
      if (!resSpaces.success) {
        expect(resSpaces.error.issues[0]?.message).toBe("Nhập email của bạn.");
      }
    });

    it("rejects invalid format", () => {
      const res = emailSchema.safeParse("invalid-email");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Email chưa đúng dạng, ví dụ ban@vi-du.com.",
        );
      }
    });

    it("rejects email exceeding 254 chars", () => {
      const longEmail = `${"a".repeat(250)}@example.com`;
      const res = emailSchema.safeParse(longEmail);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Email chưa đúng dạng, ví dụ ban@vi-du.com.",
        );
      }
    });

    it("accepts valid email and trims spaces", () => {
      const res = emailSchema.safeParse("  user@example.com  ");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBe("user@example.com");
      }
    });
  });

  describe("loginPasswordSchema & registerPasswordSchema", () => {
    it("rejects empty password with specific message", () => {
      const res = loginPasswordSchema.safeParse("");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Nhập mật khẩu.");
      }
    });

    it("rejects passwords shorter than 8 chars", () => {
      const res = loginPasswordSchema.safeParse("1234567");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Mật khẩu từ 8 đến 128 ký tự.",
        );
      }
    });

    it("rejects passwords longer than 128 chars", () => {
      const res = registerPasswordSchema.safeParse("a".repeat(129));
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Mật khẩu từ 8 đến 128 ký tự.",
        );
      }
    });

    it("accepts valid passwords (no special char requirement)", () => {
      const res = registerPasswordSchema.safeParse("simplepassword");
      expect(res.success).toBe(true);
    });
  });

  describe("displayNameSchema", () => {
    it("rejects empty name", () => {
      const res = displayNameSchema.safeParse("   ");
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Nhập họ và tên của bạn.");
      }
    });

    it("rejects name longer than 100 chars", () => {
      const res = displayNameSchema.safeParse("a".repeat(101));
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Họ và tên tối đa 100 ký tự.",
        );
      }
    });

    it("accepts valid name and trims whitespace", () => {
      const res = displayNameSchema.safeParse("  Nguyễn Văn A  ");
      expect(res.success).toBe(true);
      if (res.success) {
        expect(res.data).toBe("Nguyễn Văn A");
      }
    });
  });

  describe("termsSchema", () => {
    it("rejects false", () => {
      const res = termsSchema.safeParse(false);
      expect(res.success).toBe(false);
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe(
          "Bạn cần đồng ý với điều khoản để tạo tài khoản.",
        );
      }
    });

    it("accepts true", () => {
      const res = termsSchema.safeParse(true);
      expect(res.success).toBe(true);
    });
  });

  describe("verifyCodeSchema", () => {
    it("rejects non-6 digits", () => {
      expect(verifyCodeSchema.safeParse("12345").success).toBe(false);
      expect(verifyCodeSchema.safeParse("1234567").success).toBe(false);
      expect(verifyCodeSchema.safeParse("12345a").success).toBe(false);
      const res = verifyCodeSchema.safeParse("12345");
      if (!res.success) {
        expect(res.error.issues[0]?.message).toBe("Nhập đủ 6 chữ số.");
      }
    });

    it("accepts exactly 6 digits", () => {
      expect(verifyCodeSchema.safeParse("123456").success).toBe(true);
    });
  });

  describe("form schemas integration", () => {
    it("validates loginFormSchema", () => {
      expect(
        loginFormSchema.safeParse({
          email: "test@example.com",
          password: "password123",
        }).success,
      ).toBe(true);
    });

    it("validates registerFormSchema", () => {
      expect(
        registerFormSchema.safeParse({
          displayName: "Nguyễn Văn A",
          email: "test@example.com",
          password: "password123",
          termsAccepted: true,
        }).success,
      ).toBe(true);
    });

    it("validates verifyEmailFormSchema", () => {
      expect(verifyEmailFormSchema.safeParse({ code: "654321" }).success).toBe(
        true,
      );
    });

    it("validates forgotPasswordFormSchema", () => {
      expect(
        forgotPasswordFormSchema.safeParse({ email: "user@example.com" })
          .success,
      ).toBe(true);
      expect(
        forgotPasswordFormSchema.safeParse({ email: "not-an-email" }).success,
      ).toBe(false);
    });

    it("validates resetPasswordFormSchema", () => {
      expect(
        resetPasswordFormSchema.safeParse({
          code: "123456",
          newPassword: "securePassword123",
        }).success,
      ).toBe(true);
      expect(
        resetPasswordFormSchema.safeParse({
          code: "12345", // not 6 digits
          newPassword: "short", // less than 8 chars
        }).success,
      ).toBe(false);
    });
  });
});
