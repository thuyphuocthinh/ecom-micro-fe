import { describe, it, expect } from "vitest";
import { addressFormSchema } from "./schemas.ts";

describe("addressFormSchema (AC-7)", () => {
  const validData = {
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    provinceCode: "01",
    wardCode: "00001",
    street: "Số 123 Đường Láng",
    label: "Nhà",
    isDefault: false,
  };

  it("passes validation with full valid data", () => {
    const result = addressFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("passes validation when optional label is empty or omitted", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      label: "",
    });
    expect(result.success).toBe(true);
  });

  it("fails when recipientName is empty", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      recipientName: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Vui lòng nhập họ và tên người nhận",
      );
    }
  });

  it("fails when recipientName exceeds 100 characters", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      recipientName: "A".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Tối đa 100 ký tự");
    }
  });

  it("validates Vietnamese phone numbers correctly", () => {
    // Valid phones (10 digits starting with 0 or +84)
    const validPhones = [
      "0901234567",
      "0387654321",
      "0769998888",
      "+84901234567",
    ];
    for (const phone of validPhones) {
      const res = addressFormSchema.safeParse({ ...validData, phone });
      expect(res.success).toBe(true);
    }

    // Invalid phones
    const invalidPhones = [
      "",
      "12345",
      "01234567890",
      "012345678",
      "abcdefghij",
      "+8412345678",
    ];
    for (const phone of invalidPhones) {
      const res = addressFormSchema.safeParse({ ...validData, phone });
      expect(res.success).toBe(false);
    }
  });

  it("fails when provinceCode is empty", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      provinceCode: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Vui lòng chọn tỉnh, thành phố",
      );
    }
  });

  it("fails when wardCode is empty", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      wardCode: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Vui lòng chọn phường, xã");
    }
  });

  it("fails when street is empty", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      street: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Vui lòng nhập số nhà, tên đường",
      );
    }
  });

  it("fails when street exceeds 255 characters", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      street: "A".repeat(256),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Tối đa 255 ký tự");
    }
  });

  it("fails when label exceeds 50 characters", () => {
    const result = addressFormSchema.safeParse({
      ...validData,
      label: "A".repeat(51),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe(
        "Tên gợi nhớ tối đa 50 ký tự",
      );
    }
  });
});
