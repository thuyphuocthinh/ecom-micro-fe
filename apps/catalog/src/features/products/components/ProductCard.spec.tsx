import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProductCard } from "./ProductCard.tsx";
import type { Product } from "@/types";

const mockProduct: Product = {
  id: "prod-1",
  categoryId: "cat-1",
  name: "Tai nghe không dây Bluetooth Aero 2",
  description: "Tai nghe chống ồn chủ động cao cấp",
  thumbnail: "https://example.com/aero2.jpg",
  status: "PUBLISHED",
  minPrice: 1250000,
  onSale: true,
  discountPercent: 15,
  inStock: true,
  createdAt: "2026-10-14T10:00:00Z",
  updatedAt: "2026-10-14T10:00:00Z",
  skus: [
    {
      id: "sku-1",
      productId: "prod-1",
      code: "AERO-BLK",
      name: "Màu đen",
      price: 1250000,
      originalPrice: 1500000,
      inStock: true,
    },
    {
      id: "sku-2",
      productId: "prod-1",
      code: "AERO-WHT",
      name: "Màu trắng",
      price: 1350000,
      originalPrice: 1600000,
      inStock: true,
    },
  ],
};

function renderCard(props: Partial<Parameters<typeof ProductCard>[0]> = {}) {
  return render(
    <MemoryRouter>
      <ProductCard product={mockProduct} {...props} />
    </MemoryRouter>,
  );
}

describe("ProductCard (AC-2)", () => {
  it("renders product name, category, thumbnail, price and discount badge", () => {
    renderCard({ categoryName: "Âm thanh" });

    expect(
      screen.getByText("Tai nghe không dây Bluetooth Aero 2"),
    ).toBeInTheDocument();
    expect(screen.getByText("Âm thanh")).toBeInTheDocument();
    expect(
      screen.getByRole("img", { name: "Tai nghe không dây Bluetooth Aero 2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(screen.getByText(/từ 1\.250\.000/)).toBeInTheDocument();
    expect(screen.getByText(/1\.600\.000/)).toBeInTheDocument(); // original strike-through price
  });

  it("handles out of stock state properly", () => {
    const outOfStockProduct: Product = {
      ...mockProduct,
      inStock: false,
    };

    renderCard({ product: outOfStockProduct });

    expect(screen.getAllByText("Hết hàng").length).toBeGreaterThanOrEqual(1);
    const btn = screen.getByRole("button", { name: "Hết hàng" });
    expect(btn).toBeDisabled();
  });

  it("calls onAddToCart callback when add to cart button is clicked", async () => {
    const user = userEvent.setup();
    const handleAddToCart = vi.fn();

    renderCard({ onAddToCart: handleAddToCart });

    const btn = screen.getByRole("button", { name: /thêm vào giỏ/i });
    await user.click(btn);

    expect(handleAddToCart).toHaveBeenCalledTimes(1);
    expect(handleAddToCart).toHaveBeenCalledWith(mockProduct);
  });
});
