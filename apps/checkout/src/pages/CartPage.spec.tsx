import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { ApiError, session } from "@ecom/api";
import { createQueryClient } from "@/libs/queryClient.ts";
import { CartPage } from "./CartPage.tsx";
import { cartService } from "@/services/cart.service.ts";
import { voucherService } from "@/services/voucher.service.ts";
import { saveGuestCartItems } from "@/features/cart/utils/guest-cart.ts";
import { resetSelectedVoucherForTests } from "@/features/cart/hooks/useSelectedVoucher.ts";
import type { CartResponse, VoucherListItem, VoucherPreview } from "@/types";

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

vi.mock("@/services/voucher.service.ts", () => ({
  voucherService: { getVouchers: vi.fn(), previewVoucher: vi.fn() },
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
    sessionStorage.clear();
    session.clear();
    resetSelectedVoucherForTests();
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

  it("renders populated items and the order summary (a guest has no voucher)", async () => {
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

    // A guest cannot use a voucher: the box says so and the server is never asked
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      screen.getByText(/Đăng nhập để dùng mã giảm giá\./),
    ).toBeInTheDocument();
    expect(screen.queryByText(/ECOM50K/)).not.toBeInTheDocument();
    expect(voucherService.getVouchers).not.toHaveBeenCalled();
    expect(voucherService.previewVoucher).not.toHaveBeenCalled();
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

describe("CartPage with a voucher (a signed-in customer)", () => {
  const CART: CartResponse = {
    items: [
      {
        skuId: "sku-1",
        productId: "p-1",
        productName: "AirPods",
        thumbnail: null,
        attributes: null,
        quantity: 1,
        price: 320000,
        addedPrice: 320000,
        available: 10,
        flags: [],
      },
    ],
    subtotal: 320000,
    lineCount: 1,
    quantityCount: 1,
  };
  const LIST: VoucherListItem[] = [
    {
      code: "GIAM50K",
      name: "Giảm 50 nghìn",
      discountType: "FIXED_AMOUNT",
      value: 50000,
      maxDiscount: null,
      minOrderValue: 200000,
      endsAt: "2026-10-31T10:00:00.000Z",
      usable: true,
      reason: null,
      discountAmount: 50000,
    },
    {
      code: "BIGONLY",
      name: "Chỉ cho đơn lớn",
      discountType: "FIXED_AMOUNT",
      value: 50000,
      maxDiscount: null,
      minOrderValue: 900000,
      endsAt: "2026-10-31T10:00:00.000Z",
      usable: false,
      reason: "BELOW_MINIMUM",
      discountAmount: null,
    },
  ];
  const PREVIEW: VoucherPreview = {
    code: "GIAM50K",
    name: "Giảm 50 nghìn",
    discountType: "FIXED_AMOUNT",
    discountAmount: 50000,
    subtotal: 320000,
    total: 270000,
  };

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetSelectedVoucherForTests();
    vi.clearAllMocks();
    session.set({ accessToken: "a", refreshToken: "r" });
    // (a "once" value left by an earlier test must not leak into these)
    vi.mocked(cartService.getCart).mockReset();
    vi.mocked(voucherService.getVouchers).mockReset();
    vi.mocked(voucherService.previewVoucher).mockReset();
    vi.mocked(cartService.getCart).mockResolvedValue(CART);
    vi.mocked(voucherService.getVouchers).mockResolvedValue(LIST);
    vi.mocked(voucherService.previewVoucher).mockResolvedValue(PREVIEW);
  });

  afterAll(() => session.clear());

  it("asks for the list only when the box is opened, then picks a voucher and shows what the server says (AC-9, AC-14)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);
    await waitFor(() =>
      expect(screen.getByText("1 sản phẩm, 1 món")).toBeInTheDocument(),
    );
    expect(voucherService.getVouchers).not.toHaveBeenCalled();

    await user.click(screen.getByRole("combobox"));

    await waitFor(() => expect(screen.getAllByRole("option")).toHaveLength(2));
    expect(voucherService.getVouchers).toHaveBeenCalledTimes(1);
    await user.click(screen.getAllByRole("option")[0]);

    await waitFor(() =>
      expect(screen.getByText("Mã giảm giá (GIAM50K)")).toBeInTheDocument(),
    );
    expect(voucherService.previewVoucher).toHaveBeenCalledWith("GIAM50K");
    expect(screen.getByText("−50.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("270.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Đã áp dụng mã GIAM50K.")).toBeInTheDocument();
    // The code (and only the code) is remembered for the checkout page
    expect(sessionStorage.getItem("ecom.checkout.voucherCode")).toBe("GIAM50K");
  });

  it("a typed code works without the list (AC-13)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);
    await waitFor(() =>
      expect(screen.getByText("1 sản phẩm, 1 món")).toBeInTheDocument(),
    );

    await user.type(screen.getByRole("combobox"), "giam50k{Enter}");

    await waitFor(() =>
      expect(screen.getByText("270.000 ₫")).toBeInTheDocument(),
    );
    expect(voucherService.previewVoucher).toHaveBeenCalledWith("giam50k");
  });

  it("removing the code takes the discount away and forgets the code (AC-17)", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartPage />);
    await waitFor(() =>
      expect(screen.getByText("1 sản phẩm, 1 món")).toBeInTheDocument(),
    );
    await user.type(screen.getByRole("combobox"), "GIAM50K{Enter}");
    await waitFor(() =>
      expect(screen.getByText("270.000 ₫")).toBeInTheDocument(),
    );

    await user.click(screen.getByRole("button", { name: "Bỏ mã" }));

    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    expect(screen.getByText("Tổng cộng").nextElementSibling).toHaveTextContent(
      "320.000 ₫",
    );
    expect(screen.getByRole("combobox")).toHaveValue("");
    expect(sessionStorage.getItem("ecom.checkout.voucherCode")).toBeNull();
  });

  it("a code the server refuses: the sentence shows, no discount, the code is dropped (AC-16)", async () => {
    const user = userEvent.setup();
    vi.mocked(voucherService.previewVoucher).mockRejectedValue(
      new ApiError({
        status: 409,
        code: "VOU-004",
        message: "This voucher has been used up",
      }),
    );
    renderWithProviders(<CartPage />);
    await waitFor(() =>
      expect(screen.getByText("1 sản phẩm, 1 món")).toBeInTheDocument(),
    );

    await user.type(screen.getByRole("combobox"), "HETLUOT{Enter}");

    await waitFor(() =>
      expect(
        screen.getByText("Mã giảm giá này đã hết lượt dùng."),
      ).toBeInTheDocument(),
    );
    expect(screen.getByRole("combobox")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    expect(screen.getByText("Tổng cộng").nextElementSibling).toHaveTextContent(
      "320.000 ₫",
    );
    expect(sessionStorage.getItem("ecom.checkout.voucherCode")).toBeNull();
    // The error is shown by the page, not also as a toast
    expect(toast).not.toHaveBeenCalled();
  });

  it("a temporary failure keeps the code, says to try again, and typing it again asks again", async () => {
    const user = userEvent.setup();
    vi.mocked(voucherService.previewVoucher).mockRejectedValueOnce(
      new ApiError({ status: 503, code: "VOU-007", message: "unavailable" }),
    );
    renderWithProviders(<CartPage />);
    await waitFor(() =>
      expect(screen.getByText("1 sản phẩm, 1 món")).toBeInTheDocument(),
    );

    await user.type(screen.getByRole("combobox"), "GIAM50K{Enter}");
    await waitFor(() =>
      expect(
        screen.getByText(/Mã giảm giá tạm thời chưa dùng được/),
      ).toBeInTheDocument(),
    );
    expect(sessionStorage.getItem("ecom.checkout.voucherCode")).toBe("GIAM50K");

    await user.click(screen.getByRole("button", { name: "Áp dụng" }));

    await waitFor(() =>
      expect(screen.getByText("270.000 ₫")).toBeInTheDocument(),
    );
    expect(voucherService.previewVoucher).toHaveBeenCalledTimes(2);
  });

  it("an empty cart asks nothing about vouchers", async () => {
    vi.mocked(cartService.getCart).mockResolvedValue({
      items: [],
      subtotal: 0,
      lineCount: 0,
      quantityCount: 0,
    });
    renderWithProviders(<CartPage />);

    await waitFor(() =>
      expect(screen.getByText("Chưa có sản phẩm nào.")).toBeInTheDocument(),
    );

    expect(voucherService.getVouchers).not.toHaveBeenCalled();
    expect(voucherService.previewVoucher).not.toHaveBeenCalled();
  });
});
