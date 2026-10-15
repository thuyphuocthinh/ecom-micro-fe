import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { toast } from "sonner";
import { createQueryClient } from "@/libs/queryClient.ts";
import { CheckoutPage } from "./CheckoutPage.tsx";
import { checkoutService } from "@/services/checkout.service.ts";
import { saveGuestCartItems } from "@/features/cart/utils/guest-cart.ts";
import type { Address, Province, Ward } from "@/types";

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
    simulateGatewayPay: vi.fn(),
    simulateGatewayFail: vi.fn(),
  },
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
