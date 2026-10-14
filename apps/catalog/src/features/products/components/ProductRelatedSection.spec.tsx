import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductRelatedSection } from "./ProductRelatedSection.tsx";
import type { Product } from "@/types";

const mockRelatedProducts: Product[] = [
  {
    id: "rel-1",
    categoryId: "cat-audio",
    name: "Loa Bluetooth mini",
    status: "PUBLISHED",
    minPrice: 1290000,
    onSale: false,
    discountPercent: 0,
    inStock: true,
    createdAt: "2026-10-14T10:00:00Z",
    updatedAt: "2026-10-14T10:00:00Z",
    skus: [{ id: "s1", name: "Mini", price: 1290000, inStock: true }],
  },
  {
    id: "rel-2",
    categoryId: "cat-audio",
    name: "Sạc nhanh GaN 65W",
    status: "PUBLISHED",
    minPrice: 690000,
    onSale: false,
    discountPercent: 0,
    inStock: true,
    createdAt: "2026-10-14T10:00:00Z",
    updatedAt: "2026-10-14T10:00:00Z",
    skus: [{ id: "s2", name: "65W", price: 690000, inStock: true }],
  },
];

describe("ProductRelatedSection (AC-10)", () => {
  it("renders heading and related products list", () => {
    render(
      <MemoryRouter>
        <ProductRelatedSection
          products={mockRelatedProducts}
          categoryId="cat-audio"
          categoryName="Âm thanh"
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Có thể bạn cũng thích" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Xem tất cả sản phẩm")).toHaveAttribute(
      "href",
      "/search?category=cat-audio",
    );
    expect(screen.getByText("Loa Bluetooth mini")).toBeInTheDocument();
    expect(screen.getByText("Sạc nhanh GaN 65W")).toBeInTheDocument();
  });

  it("returns null if products array is empty", () => {
    const { container } = render(
      <MemoryRouter>
        <ProductRelatedSection products={[]} categoryId="cat-audio" />
      </MemoryRouter>,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
