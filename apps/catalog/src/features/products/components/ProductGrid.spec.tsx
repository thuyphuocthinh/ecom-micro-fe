import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { ProductGrid } from "./ProductGrid.tsx";
import type { Product } from "@/types";

describe("ProductGrid Component", () => {
  const mockProduct: Product = {
    id: "prod-1",
    categoryId: "cat-1",
    name: "Sản phẩm test",
    description: "Mô tả test",
    thumbnail: "https://example.com/test.jpg",
    status: "PUBLISHED",
    minPrice: 100000,
    onSale: false,
    discountPercent: 0,
    inStock: true,
    createdAt: "2026-10-14T00:00:00Z",
    updatedAt: "2026-10-14T00:00:00Z",
    skus: [
      {
        id: "sku-1",
        productId: "prod-1",
        code: "TEST-1",
        name: "Phiên bản 1",
        price: 100000,
        inStock: true,
      },
    ],
  };

  it("renders skeleton pulse placeholders when isLoading is true", () => {
    render(
      <MemoryRouter>
        <ProductGrid
          products={[mockProduct]} // Even if previous products exist, skeleton should show on loading
          isLoading={true}
        />
      </MemoryRouter>,
    );

    expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();
    expect(screen.queryByText("Sản phẩm test")).not.toBeInTheDocument();
  });

  it("renders empty state when products array is empty and isLoading is false", () => {
    render(
      <MemoryRouter>
        <ProductGrid products={[]} isLoading={false} />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("Không tìm thấy sản phẩm phù hợp"),
    ).toBeInTheDocument();
  });

  it("renders products list when isLoading is false and products are available", () => {
    render(
      <MemoryRouter>
        <ProductGrid
          products={[mockProduct]}
          categoryNames={{ "cat-1": "Điện tử" }}
          isLoading={false}
          onAddToCart={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.queryByTestId("product-grid-loading"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Sản phẩm test")).toBeInTheDocument();
    expect(screen.getByText("Điện tử")).toBeInTheDocument();
  });
});
