import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { createQueryClient } from "@/libs/queryClient.ts";
import { PaymentPage } from "./PaymentPage.tsx";
import { checkoutService } from "@/services/checkout.service.ts";
import type { OrderResponse, PaymentResponse } from "@/types";

const mockNavigate = vi.fn();
let mockSearch = "?orderId=ord-123";

vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
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

const mockOrder: OrderResponse = {
  id: "ord-123",
  status: "PENDING",
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
  expiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
  timeline: {
    placedAt: new Date().toISOString(),
    confirmedAt: null,
    shippedAt: null,
    deliveredAt: null,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockPayments: PaymentResponse[] = [
  {
    id: "pay-1",
    orderId: "ord-123",
    status: "INITIATED",
    amount: 4929000,
    payUrl: "https://gateway.example.com/pay/pay-1",
    expiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>,
  );
}

describe("PaymentPage Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?orderId=ord-123";
  });

  it("renders missing order id notice when no orderId is in url", async () => {
    mockSearch = "";
    renderWithProviders(<PaymentPage />);

    expect(
      screen.getByText("Không tìm thấy thông tin đơn hàng"),
    ).toBeInTheDocument();
  });

  it("renders waiting state with QR, timer, instructions and dev simulator", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValueOnce(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValueOnce(
      mockPayments,
    );

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(screen.getByText("Hoàn tất thanh toán")).toBeInTheDocument();
      expect(screen.getByText("Quét mã QR để thanh toán")).toBeInTheDocument();
      expect(
        screen.getByText("Mở trang thanh toán của cổng"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Đang chờ cổng thanh toán xác nhận…"),
      ).toBeInTheDocument();
      expect(
        screen.getByText("Giả lập cổng thanh toán (Dev Simulator)"),
      ).toBeInTheDocument();
    });
  });

  it("renders success state when order is CONFIRMED", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValueOnce({
      ...mockOrder,
      status: "CONFIRMED",
    });
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValueOnce([
      { ...mockPayments[0], status: "SUCCEEDED" },
    ]);

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(screen.getByText("Thanh toán thành công")).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Xem đơn hàng" }),
      ).toBeInTheDocument();
    });
  });

  it("renders failed state when payment is FAILED and enables retry", async () => {
    const user = userEvent.setup();

    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([
      { ...mockPayments[0], status: "FAILED" },
    ]);
    vi.mocked(checkoutService.startPayment).mockResolvedValueOnce({
      ...mockPayments[0],
      id: "pay-2",
      status: "INITIATED",
    });

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Thanh toán chưa thành công"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Thử lại, còn 2 lần/i }),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", {
      name: /Thử lại, còn 2 lần/i,
    });
    await user.click(retryBtn);

    await waitFor(() => {
      expect(checkoutService.startPayment).toHaveBeenCalledWith(
        "ord-123",
        expect.any(String),
      );
    });
  });

  it("renders expired state when order is EXPIRED", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValueOnce({
      ...mockOrder,
      status: "EXPIRED",
    });
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValueOnce([
      { ...mockPayments[0], status: "EXPIRED" },
    ]);

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(
        screen.getByText("Đã hết thời gian thanh toán"),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: "Về giỏ hàng để đặt lại" }),
      ).toBeInTheDocument();
    });
  });

  it("calls simulateGatewayPay when dev pay button is clicked", async () => {
    const user = userEvent.setup();

    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(mockPayments);
    vi.mocked(checkoutService.simulateGatewayPay).mockResolvedValueOnce({
      webhookStatus: 200,
      eventId: "evt-sim-1",
    });

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /Khách đã trả/i }),
      ).toBeInTheDocument();
    });

    const payBtn = screen.getByRole("button", { name: /Khách đã trả/i });
    await user.click(payBtn);

    await waitFor(() => {
      expect(checkoutService.simulateGatewayPay).toHaveBeenCalledWith(
        "pay-1",
        4929000,
      );
    });
  });
});
