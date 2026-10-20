import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { ApiError, session } from "@ecom/api";
import { createQueryClient } from "@/libs/queryClient.ts";
import { CheckoutPage } from "./CheckoutPage.tsx";
import { checkoutService } from "@/services/checkout.service.ts";
import { cartService } from "@/services/cart.service.ts";
import { voucherService } from "@/services/voucher.service.ts";
import { saveGuestCartItems } from "@/features/cart/utils/guest-cart.ts";
import {
  getSelectedVoucher,
  resetSelectedVoucherForTests,
  selectVoucher,
} from "@/features/cart/hooks/useSelectedVoucher.ts";
import type {
  Address,
  CartResponse,
  OrderResponse,
  Province,
  VoucherPreview,
  Ward,
} from "@/types";

const mockNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/services/checkout.service.ts", () => ({
  checkoutService: {
    getAddresses: vi.fn(),
    createAddress: vi.fn(),
    getProvinces: vi.fn(),
    getWards: vi.fn(),
    placeOrder: vi.fn(),
    getOrder: vi.fn(),
    getOrderPayments: vi.fn(),
    startPayment: vi.fn(),
  },
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

const mockAddresses: Address[] = [
  {
    id: "addr-home",
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    provinceCode: "01",
    provinceName: "Hà Nội",
    wardCode: "001",
    wardName: "Phường Phúc Xá",
    street: "12 Đường Thử",
    label: "Nhà",
    isDefault: true,
    createdAt: "2026-10-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
  {
    id: "addr-work",
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    provinceCode: "79",
    provinceName: "Thành phố Hồ Chí Minh",
    wardCode: "002",
    wardName: "Phường Bến Nghé",
    street: "88 Đường Mẫu",
    label: "Công ty",
    isDefault: false,
    createdAt: "2026-10-15T00:00:00Z",
    updatedAt: "2026-10-15T00:00:00Z",
  },
];

const mockProvinces: Province[] = [
  { code: "01", name: "Hà Nội", fullName: "Thành phố Hà Nội", type: "CITY" },
];

const mockWards: Ward[] = [
  { code: "001", name: "Phúc Xá", fullName: "Phường Phúc Xá", type: "WARD" },
];

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("CheckoutPage Integration", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    session.clear();
    resetSelectedVoucherForTests();
    vi.clearAllMocks();
    vi.mocked(checkoutService.getProvinces).mockResolvedValue(mockProvinces);
    vi.mocked(checkoutService.getWards).mockResolvedValue(mockWards);
    vi.mocked(checkoutService.getAddresses).mockResolvedValue(mockAddresses);
  });

  it("renders empty cart notice when cart has no items", async () => {
    vi.mocked(checkoutService.getAddresses).mockResolvedValueOnce([]);

    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Giỏ hàng của bạn đang trống" }),
      ).toBeInTheDocument();
    });
  });

  it("renders populated checkout page with default address and items", async () => {
    saveGuestCartItems([
      {
        skuId: "sku-1",
        productId: "prod-1",
        productName: "Tai nghe không dây Aero 2",
        thumbnail: null,
        attributes: { color: "Đen" },
        quantity: 1,
        price: 3990000,
        addedPrice: 3990000,
        available: 10,
        flags: [],
      },
    ]);
    vi.mocked(checkoutService.getAddresses).mockResolvedValueOnce(
      mockAddresses,
    );

    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Đặt hàng", level: 1 }),
      ).toBeInTheDocument();
      expect(screen.getByText("Địa chỉ giao hàng")).toBeInTheDocument();
      expect(screen.getByText("Cách thanh toán")).toBeInTheDocument();
      expect(screen.getByText("Tai nghe không dây Aero 2")).toBeInTheDocument();
      expect(screen.getAllByText("3.990.000 ₫").length).toBeGreaterThan(0);
    });

    // Default address radio should be checked
    const radios = screen.getAllByRole("radio");
    expect(radios[0]).toBeChecked();
  });

  it("allows selecting COD and placing order successfully", async () => {
    const user = userEvent.setup();

    saveGuestCartItems([
      {
        skuId: "sku-1",
        productId: "prod-1",
        productName: "Tai nghe không dây Aero 2",
        thumbnail: null,
        attributes: { color: "Đen" },
        quantity: 1,
        price: 3990000,
        addedPrice: 3990000,
        available: 10,
        flags: [],
      },
    ]);
    vi.mocked(checkoutService.getAddresses).mockResolvedValueOnce(
      mockAddresses,
    );
    vi.mocked(checkoutService.placeOrder).mockResolvedValueOnce({
      id: "ord-999",
      status: "CONFIRMED",
      paymentMethod: "COD",
      subtotal: 3990000,
      discountAmount: 0,
      voucherCode: null,
      total: 3990000,
      items: [],
      shippingAddress: {
        recipientName: "Nguyễn Văn A",
        phone: "0901234567",
        provinceCode: "01",
        provinceName: "Hà Nội",
        wardCode: "001",
        wardName: "Phường Phúc Xá",
        street: "12 Đường Thử",
        label: "Nhà",
      },
      expiresAt: "",
      timeline: {
        placedAt: "",
        confirmedAt: "",
        shippedAt: null,
        deliveredAt: null,
      },
      createdAt: "",
      updatedAt: "",
    });

    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Tiền mặt khi nhận hàng")).toBeInTheDocument();
    });

    // Select COD radio
    const codRadio = screen.getByDisplayValue("COD");
    await user.click(codRadio);

    // Place order
    const submitBtn = screen.getByRole("button", { name: "Đặt hàng" });
    await user.click(submitBtn);

    await waitFor(() => {
      expect(checkoutService.placeOrder).toHaveBeenCalledWith(
        { addressId: "addr-home", paymentMethod: "COD" },
        expect.any(String),
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        "/checkout/success?orderId=ord-999",
      );
      expect(toast.success).toHaveBeenCalledWith("Đặt hàng thành công!");
      // While the next page loads, the screen says where it is going, not "your cart is empty"
      expect(
        screen.getByText("Đang chuyển tới trang xác nhận đơn hàng…"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Giỏ hàng của bạn đang trống"),
      ).not.toBeInTheDocument();
    });
  });

  it("allows selecting new address, creating it and placing online order", async () => {
    const user = userEvent.setup();

    saveGuestCartItems([
      {
        skuId: "sku-1",
        productId: "prod-1",
        productName: "Tai nghe không dây Aero 2",
        thumbnail: null,
        attributes: { color: "Đen" },
        quantity: 1,
        price: 3990000,
        addedPrice: 3990000,
        available: 10,
        flags: [],
      },
    ]);
    vi.mocked(checkoutService.getAddresses).mockResolvedValueOnce(
      mockAddresses,
    );

    vi.mocked(checkoutService.createAddress).mockResolvedValueOnce({
      id: "addr-new-1",
      recipientName: "Trần Thị B",
      phone: "0988776655",
      provinceCode: "01",
      provinceName: "Hà Nội",
      wardCode: "001",
      wardName: "Phúc Xá",
      street: "50 Đường Mới",
      label: "Địa chỉ mới",
      isDefault: false,
      createdAt: "",
      updatedAt: "",
    });

    vi.mocked(checkoutService.placeOrder).mockResolvedValueOnce({
      id: "ord-online-1",
      status: "PENDING",
      paymentMethod: "ONLINE",
      subtotal: 3990000,
      discountAmount: 0,
      voucherCode: null,
      total: 3990000,
      items: [],
      shippingAddress: {
        recipientName: "Trần Thị B",
        phone: "0988776655",
        provinceCode: "01",
        provinceName: "Hà Nội",
        wardCode: "001",
        wardName: "Phúc Xá",
        street: "50 Đường Mới",
        label: "Địa chỉ mới",
      },
      expiresAt: "",
      timeline: {
        placedAt: "",
        confirmedAt: null,
        shippedAt: null,
        deliveredAt: null,
      },
      createdAt: "",
      updatedAt: "",
    });

    renderWithProviders(<CheckoutPage />);

    await waitFor(() => {
      expect(screen.getByText("Giao tới địa chỉ khác")).toBeInTheDocument();
    });

    // Select "Giao tới địa chỉ khác" radio (3rd address radio)
    const newAddrLabel = screen.getByText("Giao tới địa chỉ khác");
    await user.click(newAddrLabel);

    // Wait for form inputs to appear
    await waitFor(() => {
      expect(screen.getByLabelText("Họ và tên người nhận")).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText("Họ và tên người nhận");
    const phoneInput = screen.getByLabelText("Số điện thoại");
    const streetInput = screen.getByLabelText("Số nhà, tên đường");
    const provinceSelect = screen.getByLabelText("Tỉnh, thành phố");

    await user.type(nameInput, "Trần Thị B");
    await user.type(phoneInput, "0988776655");
    await user.type(streetInput, "50 Đường Mới");
    await user.selectOptions(provinceSelect, "01");

    await waitFor(() => {
      expect(screen.getByLabelText("Phường, xã")).toBeEnabled();
    });
    const wardSelect = screen.getByLabelText("Phường, xã");
    await user.selectOptions(wardSelect, "001");

    // Click "Đặt hàng và thanh toán"
    const placeBtn = screen.getByRole("button", {
      name: "Đặt hàng và thanh toán",
    });
    await user.click(placeBtn);

    await waitFor(() => {
      expect(checkoutService.createAddress).toHaveBeenCalled();
      expect(checkoutService.placeOrder).toHaveBeenCalledWith(
        { addressId: "addr-new-1", paymentMethod: "ONLINE" },
        expect.any(String),
      );
      expect(mockNavigate).toHaveBeenCalledWith(
        "/checkout/payment?orderId=ord-online-1",
      );
    });
  });
});

describe("CheckoutPage with a voucher (a signed-in customer)", () => {
  const CART: CartResponse = {
    items: [
      {
        skuId: "sku-1",
        productId: "prod-1",
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
  const PREVIEW: VoucherPreview = {
    code: "GIAM50K",
    name: "Giảm 50 nghìn",
    discountType: "FIXED_AMOUNT",
    discountAmount: 50000,
    subtotal: 320000,
    total: 270000,
  };
  const ORDER: OrderResponse = {
    id: "ord-1",
    status: "PENDING",
    paymentMethod: "ONLINE",
    subtotal: 320000,
    discountAmount: 50000,
    voucherCode: "GIAM50K",
    total: 270000,
    items: [],
    shippingAddress: {
      recipientName: "Nguyễn Văn A",
      phone: "0901234567",
      provinceCode: "01",
      provinceName: "Hà Nội",
      wardCode: "001",
      wardName: "Phường Phúc Xá",
      street: "12 Đường Thử",
      label: "Nhà",
    },
    expiresAt: "",
    timeline: {
      placedAt: "",
      confirmedAt: null,
      shippedAt: null,
      deliveredAt: null,
    },
    createdAt: "",
    updatedAt: "",
  };
  const refusal = (code: string, status = 409) =>
    new ApiError({ status, code, message: code });

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetSelectedVoucherForTests();
    session.set({ accessToken: "a", refreshToken: "r" });
    vi.clearAllMocks();
    // (a "once" value left by an earlier test must not leak into these)
    for (const fn of [
      cartService.getCart,
      voucherService.previewVoucher,
      checkoutService.placeOrder,
      checkoutService.getAddresses,
    ]) {
      vi.mocked(fn).mockReset();
    }
    vi.mocked(checkoutService.getProvinces).mockResolvedValue(mockProvinces);
    vi.mocked(checkoutService.getWards).mockResolvedValue(mockWards);
    vi.mocked(checkoutService.getAddresses).mockResolvedValue(mockAddresses);
    vi.mocked(cartService.getCart).mockResolvedValue(CART);
    vi.mocked(voucherService.previewVoucher).mockResolvedValue(PREVIEW);
    vi.mocked(checkoutService.placeOrder).mockResolvedValue(ORDER);
  });

  afterAll(() => session.clear());

  const placeButton = () =>
    screen.findByRole("button", { name: "Đặt hàng và thanh toán" });
  const bodyOfCall = (index: number) =>
    vi.mocked(checkoutService.placeOrder).mock.calls[index][0];
  const keyOfCall = (index: number) =>
    vi.mocked(checkoutService.placeOrder).mock.calls[index][1];

  describe("the summary (AC-17)", () => {
    it("shows the voucher chosen in the cart, what it takes off, and the total the server gave", async () => {
      selectVoucher("GIAM50K");

      renderWithProviders(<CheckoutPage />);

      const line = await screen.findByText(/Mã giảm giá \(GIAM50K\)/);
      expect(line.nextElementSibling).toHaveTextContent("−50.000 ₫");
      expect(
        screen.getByText("Tổng cộng").nextElementSibling,
      ).toHaveTextContent("270.000 ₫");
      expect(voucherService.previewVoucher).toHaveBeenCalledWith("GIAM50K");
      // The code is changed in the cart, not here
      expect(screen.getByRole("link", { name: "Đổi mã" })).toHaveAttribute(
        "href",
        "/cart",
      );
      expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    });

    it("without a voucher the summary is as before and the server is not asked", async () => {
      renderWithProviders(<CheckoutPage />);

      await placeButton();
      expect(screen.queryByText(/Mã giảm giá/)).not.toBeInTheDocument();
      expect(
        screen.getByText("Tổng cộng").nextElementSibling,
      ).toHaveTextContent("320.000 ₫");
      expect(voucherService.previewVoucher).not.toHaveBeenCalled();
    });

    it("a code the server refuses now: no discount, the code is dropped, and the reason is shown", async () => {
      vi.mocked(voucherService.previewVoucher).mockRejectedValue(
        refusal("VOU-004"),
      );
      selectVoucher("GIAM50K");

      renderWithProviders(<CheckoutPage />);

      expect(
        await screen.findByText(
          "Mã GIAM50K không dùng được nữa: Mã giảm giá này đã hết lượt dùng.",
        ),
      ).toHaveAttribute("role", "status");
      expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
      expect(
        screen.getByText("Tổng cộng").nextElementSibling,
      ).toHaveTextContent("320.000 ₫");
      expect(getSelectedVoucher()).toBeNull();
    });

    it("a temporary failure keeps the code and says to try again", async () => {
      vi.mocked(voucherService.previewVoucher).mockRejectedValue(
        refusal("VOU-007", 503),
      );
      selectVoucher("GIAM50K");

      renderWithProviders(<CheckoutPage />);

      const message = await screen.findByText(
        /Mã giảm giá tạm thời chưa dùng được/,
      );
      expect(message).not.toHaveTextContent("không dùng được nữa");
      expect(getSelectedVoucher()).toBe("GIAM50K");
    });
  });

  describe("placing the order with the voucher (AC-18)", () => {
    it("sends the code, then forgets it and goes on to the payment", async () => {
      const user = userEvent.setup();
      selectVoucher("GIAM50K");
      renderWithProviders(<CheckoutPage />);
      await screen.findByText(/Mã giảm giá \(GIAM50K\)/);

      await user.click(await placeButton());

      await waitFor(() =>
        expect(mockNavigate).toHaveBeenCalledWith(
          "/checkout/payment?orderId=ord-1",
        ),
      );
      expect(bodyOfCall(0)).toEqual({
        addressId: "addr-home",
        paymentMethod: "ONLINE",
        voucherCode: "GIAM50K",
      });
      expect(getSelectedVoucher()).toBeNull();
    });

    it("after the order the page never says the cart is empty and never checks the voucher on the empty cart", async () => {
      const user = userEvent.setup();
      selectVoucher("GIAM50K");
      // What the server does when it takes the order: the cart is emptied, and a voucher check on an
      // empty cart is refused (409)
      vi.mocked(checkoutService.placeOrder).mockImplementation(async () => {
        vi.mocked(cartService.getCart).mockResolvedValue({
          items: [],
          subtotal: 0,
          lineCount: 0,
          quantityCount: 0,
        });
        vi.mocked(voucherService.previewVoucher).mockRejectedValue(
          refusal("ORD-003"),
        );
        return ORDER;
      });
      renderWithProviders(<CheckoutPage />);
      await screen.findByText(/Mã giảm giá \(GIAM50K\)/);
      const cartReads = vi.mocked(cartService.getCart).mock.calls.length;
      const voucherChecks = vi.mocked(voucherService.previewVoucher).mock.calls
        .length;

      await user.click(await placeButton());

      // The cart is read again after the order (the host is told it changed): wait until that landed
      await waitFor(() =>
        expect(
          vi.mocked(cartService.getCart).mock.calls.length,
        ).toBeGreaterThan(cartReads),
      );
      expect(
        await screen.findByText("Đang chuyển tới trang thanh toán…"),
      ).toBeInTheDocument();
      expect(
        screen.queryByText("Giỏ hàng của bạn đang trống"),
      ).not.toBeInTheDocument();
      expect(vi.mocked(voucherService.previewVoucher).mock.calls.length).toBe(
        voucherChecks,
      );
    });

    it("without a voucher the field is not sent at all", async () => {
      const user = userEvent.setup();
      renderWithProviders(<CheckoutPage />);

      await user.click(await placeButton());

      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalled(),
      );
      expect(bodyOfCall(0)).not.toHaveProperty("voucherCode");
    });
  });

  describe("an order that the voucher stops (AC-19)", () => {
    it.each(["VOU-001", "VOU-002", "VOU-003", "VOU-004", "VOU-005"])(
      "%s: nothing is placed, the page stays, the code is dropped and the next press goes without it",
      async (code) => {
        const user = userEvent.setup();
        vi.mocked(checkoutService.placeOrder).mockRejectedValueOnce(
          refusal(code, code === "VOU-001" ? 404 : 409),
        );
        selectVoucher("GIAM50K");
        renderWithProviders(<CheckoutPage />);
        await screen.findByText(/Mã giảm giá \(GIAM50K\)/);

        await user.click(await placeButton());

        await waitFor(() => expect(getSelectedVoucher()).toBeNull());
        expect(mockNavigate).not.toHaveBeenCalled();
        // The summary is back to the goods and says why
        await screen.findByText(/Mã GIAM50K không dùng được nữa/);
        expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
        // The error is reported once, by the client; the page adds no second message
        expect(toast.error).not.toHaveBeenCalled();

        await user.click(await placeButton());
        await waitFor(() =>
          expect(checkoutService.placeOrder).toHaveBeenCalledTimes(2),
        );
        expect(bodyOfCall(1)).not.toHaveProperty("voucherCode");
      },
    );

    it("VOU-007 (the vouchers are out for a moment): the code and the key are kept, so pressing again retries the same order", async () => {
      const user = userEvent.setup();
      vi.mocked(checkoutService.placeOrder).mockRejectedValueOnce(
        refusal("VOU-007", 503),
      );
      selectVoucher("GIAM50K");
      renderWithProviders(<CheckoutPage />);
      await screen.findByText(/Mã giảm giá \(GIAM50K\)/);

      await user.click(await placeButton());
      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(1),
      );
      expect(getSelectedVoucher()).toBe("GIAM50K");
      await user.click(await placeButton());

      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(2),
      );
      expect(bodyOfCall(1)).toMatchObject({ voucherCode: "GIAM50K" });
      expect(keyOfCall(1)).toBe(keyOfCall(0));
    });
  });

  describe("one attempt, one Idempotency-Key (AC-20)", () => {
    it("pressing again after a failure that says nothing about the order sends the same key", async () => {
      const user = userEvent.setup();
      vi.mocked(checkoutService.placeOrder).mockRejectedValueOnce(
        new ApiError({ status: 0, code: "NETWORK", message: "offline" }),
      );
      renderWithProviders(<CheckoutPage />);

      await user.click(await placeButton());
      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(1),
      );
      await user.click(await placeButton());

      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(2),
      );
      expect(keyOfCall(1)).toBe(keyOfCall(0));
    });

    it("changing the way to pay makes a new attempt with a new key", async () => {
      const user = userEvent.setup();
      vi.mocked(checkoutService.placeOrder).mockRejectedValueOnce(
        new ApiError({ status: 0, code: "NETWORK", message: "offline" }),
      );
      renderWithProviders(<CheckoutPage />);
      await user.click(await placeButton());
      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(1),
      );

      await user.click(screen.getByDisplayValue("COD"));
      await user.click(screen.getByRole("button", { name: "Đặt hàng" }));

      await waitFor(() =>
        expect(checkoutService.placeOrder).toHaveBeenCalledTimes(2),
      );
      expect(keyOfCall(1)).not.toBe(keyOfCall(0));
      expect(bodyOfCall(1)).toMatchObject({ paymentMethod: "COD" });
    });

    it("an error that is not the API's is shown as a message, once", async () => {
      const user = userEvent.setup();
      vi.mocked(checkoutService.placeOrder).mockRejectedValueOnce(
        new Error("Đặt hàng không thành công."),
      );
      renderWithProviders(<CheckoutPage />);

      await user.click(await placeButton());

      await waitFor(() =>
        expect(toast.error).toHaveBeenCalledWith("Đặt hàng không thành công."),
      );
    });
  });
});
