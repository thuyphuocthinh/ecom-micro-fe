import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { ProductBuyBox } from "./ProductBuyBox.tsx";
import type { Product, Sku } from "@/types";

const mockSkuInStock: Sku = {
  id: "sku-ink",
  skuCode: "AERO2-INK",
  name: "Xanh đen",
  price: 3990000,
  compareAtPrice: 4590000,
  discountPercent: 13,
  inStock: true,
  stock: 24,
  attributes: { color: "Xanh đen", hex: "#101828" },
};

const mockSkuSoldOut: Sku = {
  id: "sku-blu",
  skuCode: "AERO2-BLU",
  name: "Xanh lam",
  price: 4190000,
  compareAtPrice: null,
  discountPercent: 0,
  inStock: false,
  stock: 0,
  attributes: { color: "Xanh lam", hex: "#2f6fed" },
};

const mockProduct: Product = {
  id: "prod-aero2",
  categoryId: "cat-audio",
  name: "Tai nghe không dây Aero 2",
  description: "Tai nghe chụp tai không dây, chống ồn chủ động.",
  thumbnail: "https://example.com/aero2.jpg",
  status: "PUBLISHED",
  minPrice: 3990000,
  onSale: true,
  discountPercent: 13,
  inStock: true,
  createdAt: "2026-10-14T10:00:00Z",
  updatedAt: "2026-10-14T10:00:00Z",
  skus: [mockSkuInStock, mockSkuSoldOut],
};

function renderBuyBox(
  props: Partial<Parameters<typeof ProductBuyBox>[0]> = {},
) {
  const defaultProps = {
    product: mockProduct,
    selectedSku: mockSkuInStock,
    quantity: 1,
    categoryName: "Âm thanh",
    onSelectSku: vi.fn(),
    onChangeQuantity: vi.fn(),
    onAddToCart: vi.fn(),
    onBuyNow: vi.fn(),
    ...props,
  };

  return render(
    <MemoryRouter>
      <ProductBuyBox {...defaultProps} />
    </MemoryRouter>,
  );
}

describe("ProductBuyBox (AC-4, AC-6, AC-7, AC-8)", () => {
  it("renders product title, price, discount badge, and guarantees", () => {
    renderBuyBox();

    expect(
      screen.getByRole("heading", { name: "Tai nghe không dây Aero 2" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Âm thanh")).toBeInTheDocument();
    expect(screen.getByText("3.990.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("4.590.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("-13%")).toBeInTheDocument();
    expect(screen.getByText("Còn hàng")).toBeInTheDocument();
    expect(screen.getByText(/AERO2-INK/)).toBeInTheDocument();

    // Guarantees
    expect(screen.getByText("Miễn phí vận chuyển")).toBeInTheDocument();
    expect(screen.getByText("Đổi trả trong 7 ngày")).toBeInTheDocument();
  });

  it("handles Add to Cart and Buy Now button clicks when in stock", async () => {
    const handleAddToCart = vi.fn();
    const handleBuyNow = vi.fn();
    const user = userEvent.setup();

    renderBuyBox({
      onAddToCart: handleAddToCart,
      onBuyNow: handleBuyNow,
    });

    const addBtn = screen.getByRole("button", { name: /Thêm vào giỏ/ });
    const buyBtn = screen.getByRole("button", { name: /Mua ngay/ });

    await user.click(addBtn);
    expect(handleAddToCart).toHaveBeenCalledTimes(1);

    await user.click(buyBtn);
    expect(handleBuyNow).toHaveBeenCalledTimes(1);
  });

  it("renders out-of-stock state when selected SKU is sold out (AC-8)", () => {
    renderBuyBox({
      selectedSku: mockSkuSoldOut,
    });

    expect(screen.getByText("Tạm hết hàng")).toBeInTheDocument();
    expect(screen.getByText(/Màu này tạm hết hàng/)).toBeInTheDocument();

    const outOfStockBtn = screen.getByRole("button", { name: "Hết hàng" });
    expect(outOfStockBtn).toBeDisabled();

    const similarBtn = screen.getByRole("link", {
      name: "Xem sản phẩm tương tự",
    });
    expect(similarBtn).toHaveAttribute("href", "/search?category=cat-audio");
  });
});
