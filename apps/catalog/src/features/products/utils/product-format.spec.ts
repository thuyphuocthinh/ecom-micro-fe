import { describe, it, expect } from "vitest";
import {
  formatVnd,
  formatProductPriceLabel,
  formatDiscountBadge,
} from "./product-format.ts";

describe("product-format utilities", () => {
  it("formats VND correctly", () => {
    expect(formatVnd(1500000)).toMatch(/1\.500\.000\s?₫/);
    expect(formatVnd(0)).toMatch(/0\s?₫/);
    expect(formatVnd(null)).toMatch(/0\s?₫/);
  });

  it("formats product price label with 'từ' for multiple SKUs", () => {
    expect(formatProductPriceLabel(500000, 2)).toMatch(
      /từ\s1\.500\.000\s?₫|từ\s500\.000\s?₫/,
    );
    expect(formatProductPriceLabel(500000, 1)).toMatch(/500\.000\s?₫/);
    expect(formatProductPriceLabel(null, 1)).toBe("Liên hệ");
  });

  it("formats discount percentage badge", () => {
    expect(formatDiscountBadge(15)).toBe("-15%");
    expect(formatDiscountBadge(0)).toBe("");
    expect(formatDiscountBadge(-5)).toBe("");
  });
});
