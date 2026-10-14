import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatCartHeaderCount,
  formatAttributes,
  formatPriceDrop,
  formatLowStock,
} from "./cart-format.ts";

describe("cart-format utilities", () => {
  describe("formatCurrency", () => {
    it("formats VND currency with proper separator and symbol", () => {
      expect(formatCurrency(0)).toBe("0 ₫");
      expect(formatCurrency(50000)).toBe("50.000 ₫");
      expect(formatCurrency(1290000)).toBe("1.290.000 ₫");
    });
  });

  describe("formatCartHeaderCount", () => {
    it("returns empty string when count is 0", () => {
      expect(formatCartHeaderCount(0, 0)).toBe("Chưa có sản phẩm nào.");
    });

    it("returns formatted count string when count > 0", () => {
      expect(formatCartHeaderCount(1, 1)).toBe("1 sản phẩm, 1 món");
      expect(formatCartHeaderCount(3, 5)).toBe("3 sản phẩm, 5 món");
    });
  });

  describe("formatAttributes", () => {
    it("joins attribute values with middle dot", () => {
      expect(formatAttributes(null)).toBe("");
      expect(formatAttributes(undefined)).toBe("");
      expect(formatAttributes({ color: "Xanh", size: "L" })).toBe("Xanh · L");
    });
  });

  describe("formatPriceDrop", () => {
    it("returns price drop message when addedPrice > currentPrice", () => {
      expect(formatPriceDrop(4590000, 3990000)).toBe(
        "Giá giảm từ 4.590.000 ₫ khi bạn thêm vào giỏ",
      );
    });

    it("returns null when addedPrice <= currentPrice", () => {
      expect(formatPriceDrop(100000, 100000)).toBeNull();
      expect(formatPriceDrop(100000, 150000)).toBeNull();
    });
  });

  describe("formatLowStock", () => {
    it("returns low stock message when available between 1 and 5", () => {
      expect(formatLowStock(1)).toBe("Chỉ còn 1 sản phẩm");
      expect(formatLowStock(5)).toBe("Chỉ còn 5 sản phẩm");
    });

    it("returns null when available > 5, 0 or null", () => {
      expect(formatLowStock(6)).toBeNull();
      expect(formatLowStock(0)).toBeNull();
      expect(formatLowStock(null)).toBeNull();
    });
  });
});
