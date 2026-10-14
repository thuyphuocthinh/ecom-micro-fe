import { describe, it, expect } from "vitest";
import { updateProfileSchema, changePasswordSchema } from "./schemas.ts";

describe("updateProfileSchema", () => {
  it("passes with valid display name", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "Nguyễn Văn A",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Nguyễn Văn A");
    }
  });

  it("trims whitespace", () => {
    const result = updateProfileSchema.safeParse({
      displayName: "   Trần Thị B   ",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.displayName).toBe("Trần Thị B");
    }
  });

  it("fails when empty or only whitespace", () => {
    const emptyResult = updateProfileSchema.safeParse({ displayName: "" });
    expect(emptyResult.success).toBe(false);
    if (!emptyResult.success) {
      expect(emptyResult.error.issues[0].message).toBe(
        "Họ và tên không được để trống",
      );
    }

    const whitespaceResult = updateProfileSchema.safeParse({
      displayName: "   ",
    });
    expect(whitespaceResult.success).toBe(false);
    if (!whitespaceResult.success) {
      expect(whitespaceResult.error.issues[0].message).toBe(
        "Họ và tên không được để trống",
      );
    }
  });

  it("fails when exceeding 100 characters", () => {
    const longName = "A".repeat(101);
    const result = updateProfileSchema.safeParse({ displayName: longName });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Tối đa 100 ký tự");
    }
  });
});

describe("changePasswordSchema", () => {
  it("passes with valid passwords", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword456!",
      confirmPassword: "NewPassword456!",
    });
    expect(result.success).toBe(true);
  });

  it("fails when current password is empty", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "",
      newPassword: "NewPassword456!",
      confirmPassword: "NewPassword456!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nhập mật khẩu hiện tại.");
    }
  });

  it("fails when new password is shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "short",
      confirmPassword: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message.includes("ít nhất 8 ký tự")),
      ).toBe(true);
    }
  });

  it("fails when new password exceeds 128 characters", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "P".repeat(129),
      confirmPassword: "P".repeat(129),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(
        result.error.issues.some((i) => i.message.includes("tối đa 128 ký tự")),
      ).toBe(true);
    }
  });

  it("fails when new password matches current password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "SamePassword123!",
      newPassword: "SamePassword123!",
      confirmPassword: "SamePassword123!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Mật khẩu mới không được trùng với mật khẩu hiện tại",
      );
      expect(result.error.issues[0].path).toEqual(["newPassword"]);
    }
  });

  it("fails when confirm password does not match new password", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "OldPassword123!",
      newPassword: "NewPassword456!",
      confirmPassword: "DifferentPassword789!",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Mật khẩu xác nhận không khớp",
      );
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });
});
