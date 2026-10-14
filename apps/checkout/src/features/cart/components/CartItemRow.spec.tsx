import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CartItemRow } from "./CartItemRow.tsx";
import type { CartLineItem } from "@/types";

describe("CartItemRow", () => {
  const mockItem: CartLineItem = {
    skuId: "sku-1",
    productId: "prod-1",
    productName: "Tai nghe không dây Aero 2",
    thumbnail: "https://example.com/aero.jpg",
    attributes: { "Màu sắc": "Xanh đen" },
    quantity: 2,
    price: 3990000,
    addedPrice: 4590000,
    available: 10,
    flags: [],
  };

  it("renders product name with link, attributes, unit price, and line total", () => {
    render(
      <MemoryRouter>
        <CartItemRow
          item={mockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    const link = screen.getByRole("link", {
      name: "Tai nghe không dây Aero 2",
    });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/products/prod-1");

    expect(screen.getByText("Xanh đen")).toBeInTheDocument();
    expect(screen.getByText("3.990.000 ₫ mỗi sản phẩm")).toBeInTheDocument();
    // 3.990.000 * 2 = 7.980.000
    expect(screen.getByText("7.980.000 ₫")).toBeInTheDocument();
  });

  it("renders price drop tag when addedPrice > price", () => {
    render(
      <MemoryRouter>
        <CartItemRow
          item={mockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Giá giảm từ 4.590.000 ₫ khi bạn thêm vào giỏ"),
    ).toBeInTheDocument();
  });

  it("renders low stock tag when available <= 5", () => {
    const lowStockItem: CartLineItem = {
      ...mockItem,
      available: 3,
      addedPrice: 3990000,
    };

    render(
      <MemoryRouter>
        <CartItemRow
          item={lowStockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Chỉ còn 3 sản phẩm")).toBeInTheDocument();
  });

  it("handles quantity decrease and increase, respecting min and max bounds", async () => {
    const user = userEvent.setup();
    const handleUpdate = vi.fn();

    const { rerender } = render(
      <MemoryRouter>
        <CartItemRow
          item={mockItem}
          onUpdateQuantity={handleUpdate}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    const decBtn = screen.getByRole("button", {
      name: `Giảm số lượng ${mockItem.productName}`,
    });
    const incBtn = screen.getByRole("button", {
      name: `Tăng số lượng ${mockItem.productName}`,
    });

    expect(decBtn).not.toBeDisabled();
    expect(incBtn).not.toBeDisabled();

    await user.click(incBtn);
    expect(handleUpdate).toHaveBeenCalledWith("sku-1", 3);

    await user.click(decBtn);
    expect(handleUpdate).toHaveBeenCalledWith("sku-1", 1);

    // Test at min (quantity = 1)
    rerender(
      <MemoryRouter>
        <CartItemRow
          item={{ ...mockItem, quantity: 1 }}
          onUpdateQuantity={handleUpdate}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    const decBtnAtMin = screen.getByRole("button", {
      name: `Giảm số lượng ${mockItem.productName}`,
    });
    expect(decBtnAtMin).toBeDisabled();

    // Test at max (quantity = available)
    rerender(
      <MemoryRouter>
        <CartItemRow
          item={{ ...mockItem, quantity: 10, available: 10 }}
          onUpdateQuantity={handleUpdate}
          onRemove={vi.fn()}
        />
      </MemoryRouter>,
    );

    const incBtnAtMax = screen.getByRole("button", {
      name: `Tăng số lượng ${mockItem.productName}`,
    });
    expect(incBtnAtMax).toBeDisabled();
  });

  it("calls onRemove when clicking delete button", async () => {
    const user = userEvent.setup();
    const handleRemove = vi.fn();

    render(
      <MemoryRouter>
        <CartItemRow
          item={mockItem}
          onUpdateQuantity={vi.fn()}
          onRemove={handleRemove}
        />
      </MemoryRouter>,
    );

    const removeBtn = screen.getByRole("button", {
      name: `Xoá ${mockItem.productName} khỏi giỏ hàng`,
    });
    await user.click(removeBtn);

    expect(handleRemove).toHaveBeenCalledWith("sku-1");
  });
});
