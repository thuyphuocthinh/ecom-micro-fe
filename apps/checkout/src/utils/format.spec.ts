import { describe, it, expect } from "vitest";
import { formatCurrency } from "./format";

describe("formatCurrency", () => {
  it("formats positive numbers with vnd symbol", () => {
    expect(formatCurrency(100000)).toMatch(/100\.000\s*₫/);
    expect(formatCurrency(0)).toMatch(/0\s*₫/);
  });
});
