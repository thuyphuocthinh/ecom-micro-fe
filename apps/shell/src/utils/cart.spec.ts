import { describe, it, expect } from "vitest";
import { formatCartAriaLabel } from "./cart.ts";

describe("formatCartAriaLabel", () => {
  it("formats zero count as empty", () => {
    expect(formatCartAriaLabel(0)).toBe("Giỏ hàng, đang trống");
    expect(formatCartAriaLabel(-1)).toBe("Giỏ hàng, đang trống");
  });

  it("formats positive count with number of products", () => {
    expect(formatCartAriaLabel(1)).toBe("Giỏ hàng, 1 sản phẩm");
    expect(formatCartAriaLabel(5)).toBe("Giỏ hàng, 5 sản phẩm");
    expect(formatCartAriaLabel(99)).toBe("Giỏ hàng, 99 sản phẩm");
  });
});
