import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { createQueryClient } from "@/libs/queryClient.ts";
import { OrderSuccessPage } from "./OrderSuccessPage.tsx";
import { checkoutService } from "@/services/checkout.service.ts";
import type { OrderResponse } from "@/types";

let mockSearch = "?orderId=ord-123";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useSearchParams: () => [new URLSearchParams(mockSearch)],
  };
});

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

const mockOnlineOrder: OrderResponse = {
  id: "ord-12345678",
  status: "CONFIRMED",
  paymentMethod: "ONLINE",
  total: 4929000,
  items: [
    {
      skuId: "sku-1",
      productName: "Tai nghe không dây Aero 2",
      thumbnail: null,
      attributes: {},
      unitPrice: 3990000,
      quantity: 1,
      lineTotal: 3990000,
    },
    {
      skuId: "sku-2",
      productName: "Áo thun cotton",
      thumbnail: null,
      attributes: {},
      unitPrice: 939000,
      quantity: 1,
      lineTotal: 939000,
    },
  ],
  shippingAddress: {
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    provinceCode: "01",
    provinceName: "Hà Nội",
    wardCode: "001",
    wardName: "Phúc Xá",
    street: "12 Đường Thử",
    label: "Nhà",
  },
  expiresAt: new Date().toISOString(),
  timeline: {
    placedAt: new Date().toISOString(),
    confirmedAt: new Date().toISOString(),
    shippedAt: null,
    deliveredAt: null,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("OrderSuccessPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?orderId=ord-12345678";
  });

  it("renders notice when no orderId is provided", () => {
    mockSearch = "";
    renderWithProviders(<OrderSuccessPage />);

    expect(
      screen.getByText("Không tìm thấy thông tin đơn hàng"),
    ).toBeInTheDocument();
  });

  it("renders confirmed order details, products, and tracking timeline for online order", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValueOnce(mockOnlineOrder);

    renderWithProviders(<OrderSuccessPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cảm ơn bạn, đơn hàng đã được xác nhận."),
      ).toBeInTheDocument();
      expect(screen.getByText("Mã đơn: #ORD-1234")).toBeInTheDocument();
      expect(screen.getByText("Hành trình đơn hàng")).toBeInTheDocument();
      expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
      expect(screen.getByText("Đang giao")).toBeInTheDocument();
      expect(screen.getByText("Đã giao")).toBeInTheDocument();
      expect(screen.getByText("Tai nghe không dây Aero 2")).toBeInTheDocument();
      expect(screen.getByText("Áo thun cotton")).toBeInTheDocument();
      expect(screen.getByText("Đã thanh toán")).toBeInTheDocument();
      expect(screen.getByText("Đã nhận tiền")).toBeInTheDocument();
      expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Tiếp tục mua sắm" }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Xem đơn hàng" }),
      ).toBeInTheDocument();
    });
  });

  it("renders COD order details correctly", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValueOnce({
      ...mockOnlineOrder,
      paymentMethod: "COD",
    });

    renderWithProviders(<OrderSuccessPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Cần thanh toán khi nhận hàng"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Tiền mặt khi nhận hàng (COD)"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Chờ thanh toán khi nhận hàng"),
      ).toBeInTheDocument();
    });
  });
});
