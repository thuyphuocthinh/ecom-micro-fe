import { describe, expect, it } from "vitest";
import {
  ALL_PRODUCTS_HREF,
  productHref,
  SALE_HREF,
  searchHrefForCategory,
} from "./category-link.ts";

describe("links of the store (AC-15, AC-16, AC-17, AC-21)", () => {
  it("the sale link uses onSale, the name the search page reads (not sale)", () => {
    expect(SALE_HREF).toBe("/search?onSale=true");
    expect(SALE_HREF).not.toContain("sale=true&");
    expect(new URLSearchParams(SALE_HREF.split("?")[1]).get("onSale")).toBe(
      "true",
    );
  });

  it("all products is the search page with no filter", () => {
    expect(ALL_PRODUCTS_HREF).toBe("/search");
  });

  it("a category link carries the id the API gave", () => {
    expect(searchHrefForCategory("seed_cat_electronics")).toBe(
      "/search?category=seed_cat_electronics",
    );
  });

  it("an id with special characters stays one value", () => {
    const href = searchHrefForCategory("a&b=c d");

    expect(new URLSearchParams(href.split("?")[1]).get("category")).toBe(
      "a&b=c d",
    );
    expect(href).toBe("/search?category=a%26b%3Dc%20d");
  });

  it("a product link is the page of that product", () => {
    expect(productHref("seed_prod_iphone15")).toBe(
      "/products/seed_prod_iphone15",
    );
    expect(productHref("a/b")).toBe("/products/a%2Fb");
  });
});
