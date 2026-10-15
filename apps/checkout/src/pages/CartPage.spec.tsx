import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { createQueryClient } from "@/libs/queryClient.ts";
import { CartPage } from "./CartPage.tsx";
import { cartService } from "@/services/cart.service.ts";
import { saveGuestCartItems } from "@/features/cart/utils/guest-cart.ts";
import type { CartResponse } from "@/types";

vi.mock("sonner", () => ({
  toast: vi.fn(),
}));

vi.mock("@/services/cart.service.ts", () => ({
  cartService: {
    getCart: vi.fn(),
    addItem: vi.fn(),
    setQuantity: vi.fn(),
    removeItem: vi.fn(),
    clearCart: vi.fn(),
  },
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CartPage Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it("renders empty state when cart has no items", async () => {
    vi.mocked(cartService.getCart).mockResolvedValueOnce({
      items: [],
      subtotal: 0,
      lineCount: 0,
      quantityCount: 0,
    });

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Chưa có sản phẩm nào.")).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Giỏ hàng đang trống", level: 2 }),
      ).toBeInTheDocument();
    });
  });

  it("renders populated items, calculates order summary, and applies coupon", async () => {
    const user = userEvent.setup();

    const mockCartData: CartResponse = {
      items: [
        {
          skuId: "sku-1",
          productId: "p-1",
          productName: "Tai nghe Aero 2",
          thumbnail: null,
          attributes: { "Màu sắc": "Đen" },
          quantity: 2,
          price: 1000000,
          addedPrice: 1200000,
          available: 10,
          flags: [],
        },
        {
          skuId: "sku-2",
          productId: "p-2",
          productName: "Áo thun Ecom",
          thumbnail: null,
          attributes: null,
          quantity: 1,
          price: 200000,
          addedPrice: 200000,
          available: 2,
          flags: ["notEnoughStock"],
        },
      ],
      // 2*1000000 + 1*200000 = 2.200.000
      subtotal: 2200000,
      lineCount: 2,
      quantityCount: 3,
    };

    // Use guest cart in localStorage for seamless state manipulation
    saveGuestCartItems(
      mockCartData.items.map((i) => ({
        ...i,
        productName: i.productName || "Sản phẩm",
        price: i.price ?? 0,
      })),
    );

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("2 sản phẩm, 3 món")).toBeInTheDocument();
    });

    expect(screen.getByText("Tai nghe Aero 2")).toBeInTheDocument();
    expect(screen.getByText("Áo thun Ecom")).toBeInTheDocument();
    expect(screen.getAllByText("2.200.000 ₫")).toHaveLength(2);

    // Check discount application
    const couponInput = screen.getByPlaceholderText("Ví dụ: ECOM50K…");
    const applyBtn = screen.getByRole("button", { name: "Áp dụng" });

    await user.type(couponInput, "ECOM50K");
    await user.click(applyBtn);

    expect(screen.getByText("Đã áp dụng mã ECOM50K.")).toBeInTheDocument();
    expect(screen.getByText("−50.000 ₫")).toBeInTheDocument();
    // 2.200.000 - 50.000 = 2.150.000
    expect(screen.getByText("2.150.000 ₫")).toBeInTheDocument();
  });

  it("handles remove item and undo toast restoration", async () => {
    const user = userEvent.setup();

    saveGuestCartItems([
      {
        skuId: "sku-remove",
        productId: "p-remove",
        productName: "Bình giữ nhiệt Ecom",
        thumbnail: null,
        attributes: null,
        quantity: 1,
        price: 300000,
        addedPrice: 300000,
        available: 5,
      },
    ]);

    renderWithProviders(<CartPage />);

    await waitFor(() => {
      expect(screen.getByText("Bình giữ nhiệt Ecom")).toBeInTheDocument();
    });

    // Remove the item
    const removeBtn = screen.getByRole("button", {
      name: "Xoá Bình giữ nhiệt Ecom khỏi giỏ hàng",
    });
    await user.click(removeBtn);

    // Undo toast should be called
    await waitFor(() => {
      expect(toast).toHaveBeenCalledWith(
        "Đã xoá Bình giữ nhiệt Ecom",
        expect.objectContaining({
          action: expect.objectContaining({
            label: "Hoàn tác",
            onClick: expect.any(Function),
          }),
        }),
      );
    });

    // Execute undo action
    const toastCalls = vi.mocked(toast).mock.calls;
    const lastCall = toastCalls[toastCalls.length - 1];
    const options = lastCall?.[1] as
      { action?: { onClick?: () => void } } | undefined;
    options?.action?.onClick?.();

    // Item should be restored
    await waitFor(() => {
      expect(screen.getByText("Bình giữ nhiệt Ecom")).toBeInTheDocument();
    });
  });
});
