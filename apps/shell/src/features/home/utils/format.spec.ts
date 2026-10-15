import { describe, it, expect } from "vitest";
import {
  formatVND,
  calculateDiscountPercent,
  formatReviewCount,
  formatRating,
} from "@/features/home/utils/format.ts";

describe("format utils", () => {
  it("formatVND formats valid numbers and edge cases", () => {
    expect(formatVND(3990000)).toMatch(/3\.990\.000.*₫/);
    expect(formatVND(0)).toMatch(/0.*₫/);
    expect(formatVND(NaN)).toBe("0 ₫");
  });

  it("calculateDiscountPercent calculates percent correctly", () => {
    expect(calculateDiscountPercent(3990000, 4590000)).toBe("Giảm 13%");
    expect(calculateDiscountPercent(320000, 390000)).toBe("Giảm 18%");
    expect(calculateDiscountPercent(100, null)).toBeNull();
    expect(calculateDiscountPercent(100, 100)).toBeNull();
    expect(calculateDiscountPercent(120, 100)).toBeNull();
  });

  it("formatReviewCount formats numbers with thousands separators", () => {
    expect(formatReviewCount(1240)).toMatch(/1[.,]240/);
    expect(formatReviewCount(0)).toBe("0");
    expect(formatReviewCount(-5)).toBe("0");
  });

  it("formatRating formats ratings with 1 decimal", () => {
    expect(formatRating(4.8)).toMatch(/4[.,]8/);
    expect(formatRating(5)).toMatch(/5[.,]0/);
    expect(formatRating(NaN)).toMatch(/0[.,]0/);
  });
});
