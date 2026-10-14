import { describe, it, expect } from "vitest";
import { sanitizeReturnTo } from "./redirect.ts";

describe("sanitizeReturnTo (AC-25)", () => {
  it("accepts valid internal paths", () => {
    expect(sanitizeReturnTo("/")).toBe("/");
    expect(sanitizeReturnTo("/account/orders")).toBe("/account/orders");
    expect(sanitizeReturnTo("/p/iphone-15?tab=reviews")).toBe(
      "/p/iphone-15?tab=reviews",
    );
  });

  it("rejects protocol-relative and external urls", () => {
    expect(sanitizeReturnTo("https://evil.example")).toBe("/");
    expect(sanitizeReturnTo("http://evil.example")).toBe("/");
    expect(sanitizeReturnTo("//evil.example")).toBe("/");
    expect(sanitizeReturnTo("/\\evil.example")).toBe("/");
    expect(sanitizeReturnTo("javascript:alert(1)")).toBe("/");
    expect(sanitizeReturnTo("data:text/html,test")).toBe("/");
  });

  it("falls back to default fallback when input is empty or null", () => {
    expect(sanitizeReturnTo(null)).toBe("/");
    expect(sanitizeReturnTo(undefined)).toBe("/");
    expect(sanitizeReturnTo("")).toBe("/");
    expect(sanitizeReturnTo("", "/custom")).toBe("/custom");
  });
});
