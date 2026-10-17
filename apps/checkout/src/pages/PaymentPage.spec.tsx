import { StrictMode } from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { api, type StreamOptions } from "@ecom/api";
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
  subtotal: 4929000,
  discountAmount: 0,
  voucherCode: null,
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
    // The reference of the charge at the gateway is in the address, and is not the id of the payment.
    payUrl: "/dev/fake-gateway/charges/fake_abc",
    expiresAt: new Date(Date.now() + 14 * 60 * 1000).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// The stream of the order status is replaced by one the tests drive: `streams[0].onMessage(...)` plays a
// message of the server. Nothing here touches the network.
let streams: StreamOptions[] = [];

beforeEach(() => {
  streams = [];
  vi.spyOn(api, "stream").mockImplementation(
    (_path, options) =>
      new Promise<void>((resolve) => {
        streams.push(options);
        options.signal?.addEventListener("abort", () => resolve());
      }),
  );
});

afterEach(() => {
  vi.mocked(api.stream).mockRestore();
});

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
        "pay-ord-123-2",
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
        "fake_abc",
        4929000,
      );
    });
  });

  it("calls simulateGatewayFail with the reference of the charge, not the id of the payment (AC-4)", async () => {
    const user = userEvent.setup();

    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(mockPayments);
    vi.mocked(checkoutService.simulateGatewayFail).mockResolvedValueOnce({
      webhookStatus: 200,
      eventId: "evt-sim-2",
    });

    renderWithProviders(<PaymentPage />);
    await user.click(
      await screen.findByRole("button", { name: /Giao dịch thất bại/i }),
    );

    await waitFor(() => {
      expect(checkoutService.simulateGatewayFail).toHaveBeenCalledWith(
        "fake_abc",
      );
    });
    expect(checkoutService.simulateGatewayFail).not.toHaveBeenCalledWith(
      "pay-1",
    );
  });

  it.each([
    ["no address", null],
    ["an address without a path", "https://gateway.example.com"],
  ])(
    "does not show the simulator when the payment has %s (AC-5)",
    async (_name, payUrl) => {
      vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
      vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([
        { ...mockPayments[0], payUrl },
      ]);

      renderWithProviders(<PaymentPage />);

      expect(
        await screen.findByText("Hoàn tất thanh toán"),
      ).toBeInTheDocument();
      expect(screen.queryByText(/Dev Simulator/i)).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Khách đã trả/i }),
      ).not.toBeInTheDocument();
      expect(checkoutService.simulateGatewayPay).not.toHaveBeenCalled();
    },
  );
});

describe("PaymentPage with an order that used a voucher (AC-21)", () => {
  const discounted: OrderResponse = {
    ...mockOrder,
    subtotal: 4929000,
    discountAmount: 50000,
    voucherCode: "GIAM50K",
    total: 4879000,
  };
  const discountedPayments: PaymentResponse[] = [
    { ...mockPayments[0], amount: 4879000 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?orderId=ord-123";
  });

  it("shows the goods, the voucher and what must be paid, which is the discounted total", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValue(discounted);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(
      discountedPayments,
    );

    renderWithProviders(<PaymentPage />);

    await screen.findByText("Mã giảm giá (GIAM50K)");
    expect(screen.getByText("Tạm tính")).toBeInTheDocument();
    expect(screen.getByText("−50.000 ₫")).toBeInTheDocument();
    const due = screen.getByText("Cần thanh toán");
    expect(due.nextElementSibling).toHaveTextContent("4.879.000 ₫");
  });

  it("the gateway simulator is asked to charge the discounted total, not the goods", async () => {
    const user = userEvent.setup();
    vi.mocked(checkoutService.getOrder).mockResolvedValue(discounted);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(
      discountedPayments,
    );
    vi.mocked(checkoutService.simulateGatewayPay).mockResolvedValueOnce({
      webhookStatus: 200,
      eventId: "evt-sim-2",
    });

    renderWithProviders(<PaymentPage />);
    await user.click(
      await screen.findByRole("button", { name: /Khách đã trả/i }),
    );

    await waitFor(() => {
      expect(checkoutService.simulateGatewayPay).toHaveBeenCalledWith(
        "fake_abc",
        4879000,
      );
    });
  });

  it("an order without a voucher has no discount line", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(mockPayments);

    renderWithProviders(<PaymentPage />);

    await screen.findByText("Cần thanh toán");
    expect(screen.queryByText(/Mã giảm giá/)).not.toBeInTheDocument();
    expect(screen.queryByText("Tạm tính")).not.toBeInTheDocument();
  });
});

describe("PaymentPage starting the payment (AC-1, AC-2, AC-3)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?orderId=ord-123";
    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
  });

  it("starts the first payment with the key of order and attempt 1 (AC-1)", async () => {
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([]);
    vi.mocked(checkoutService.startPayment).mockResolvedValue(mockPayments[0]);

    renderWithProviders(<PaymentPage />);

    await waitFor(() => {
      expect(checkoutService.startPayment).toHaveBeenCalledWith(
        "ord-123",
        "pay-ord-123-1",
      );
    });
  });

  it("sends the same key whenever the page asks again: drawn twice, or opened again (AC-1)", async () => {
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([]);
    vi.mocked(checkoutService.startPayment).mockResolvedValue(mockPayments[0]);

    const first = render(
      <StrictMode>
        <QueryClientProvider client={createQueryClient()}>
          <MemoryRouter>
            <PaymentPage />
          </MemoryRouter>
        </QueryClientProvider>
      </StrictMode>,
    );
    await waitFor(() =>
      expect(checkoutService.startPayment).toHaveBeenCalled(),
    );
    first.unmount();

    // Opened again before the first payment shows in the list: a new page, a new query cache.
    renderWithProviders(<PaymentPage />);
    await waitFor(() =>
      expect(
        vi.mocked(checkoutService.startPayment).mock.calls.length,
      ).toBeGreaterThan(1),
    );

    const keys = vi
      .mocked(checkoutService.startPayment)
      .mock.calls.map(([, key]) => key);
    expect(new Set(keys)).toEqual(new Set(["pay-ord-123-1"]));
  });

  it("does not start a payment while the list of payments is still loading (AC-2)", async () => {
    let answer: (payments: PaymentResponse[]) => void = () => {};
    vi.mocked(checkoutService.getOrderPayments).mockReturnValue(
      new Promise((resolve) => {
        answer = resolve;
      }),
    );

    renderWithProviders(<PaymentPage />);
    await waitFor(() => expect(checkoutService.getOrder).toHaveBeenCalled());
    // Let the order arrive and the page act on it before the list does.
    await new Promise((resolve) => setTimeout(resolve, 50));
    expect(checkoutService.startPayment).not.toHaveBeenCalled();

    // The list arrives with a payment that is already waiting: still nothing to start.
    answer(mockPayments);
    expect(await screen.findByText("Hoàn tất thanh toán")).toBeInTheDocument();
    expect(checkoutService.startPayment).not.toHaveBeenCalled();
  });

  it("retries with the key of the next attempt, and a double click sends the same key (AC-3)", async () => {
    const user = userEvent.setup();
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([
      { ...mockPayments[0], status: "FAILED" },
    ]);
    vi.mocked(checkoutService.startPayment).mockResolvedValue({
      ...mockPayments[0],
      id: "pay-2",
    });

    renderWithProviders(<PaymentPage />);
    const retry = await screen.findByRole("button", {
      name: /Thử lại, còn 2 lần/i,
    });
    await user.dblClick(retry);

    await waitFor(() =>
      expect(checkoutService.startPayment).toHaveBeenCalled(),
    );
    const keys = vi
      .mocked(checkoutService.startPayment)
      .mock.calls.map(([, key]) => key);
    expect(new Set(keys)).toEqual(new Set(["pay-ord-123-2"]));
  });
});

describe("PaymentPage learns of changes from the stream (AC-9, AC-8)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearch = "?orderId=ord-123";
  });

  const confirmed = { ...mockOrder, status: "CONFIRMED" } as OrderResponse;

  it("opens the stream of this order while it waits for the payment", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(mockPayments);

    renderWithProviders(<PaymentPage />);
    await screen.findByText("Quét mã QR để thanh toán");

    expect(api.stream).toHaveBeenCalledTimes(1);
    expect(api.stream).toHaveBeenCalledWith(
      "/orders/{id}/events",
      expect.objectContaining({ params: { id: "ord-123" } }),
    );
  });

  it("does not open a stream for an order that is already paid", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValue(confirmed);
    vi.mocked(checkoutService.getOrderPayments).mockResolvedValue([
      { ...mockPayments[0], status: "SUCCEEDED" },
    ]);

    renderWithProviders(<PaymentPage />);
    await screen.findByText("Thanh toán thành công");

    expect(api.stream).not.toHaveBeenCalled();
  });

  it("shows the success state when a CONFIRMED message arrives", async () => {
    vi.mocked(checkoutService.getOrder)
      .mockResolvedValueOnce(mockOrder)
      .mockResolvedValue(confirmed);
    vi.mocked(checkoutService.getOrderPayments)
      .mockResolvedValueOnce(mockPayments)
      .mockResolvedValue([{ ...mockPayments[0], status: "SUCCEEDED" }]);

    renderWithProviders(<PaymentPage />);
    await screen.findByText("Quét mã QR để thanh toán");

    act(() =>
      streams[0].onMessage("status", {
        orderId: "ord-123",
        status: "CONFIRMED",
      }),
    );

    expect(
      await screen.findByText("Thanh toán thành công"),
    ).toBeInTheDocument();
  });

  it("shows the failed state, with a retry, when a PENDING message follows a failed payment", async () => {
    vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
    vi.mocked(checkoutService.getOrderPayments)
      .mockResolvedValueOnce(mockPayments)
      .mockResolvedValue([{ ...mockPayments[0], status: "FAILED" }]);

    renderWithProviders(<PaymentPage />);
    await screen.findByText("Quét mã QR để thanh toán");

    act(() =>
      streams[0].onMessage("status", { orderId: "ord-123", status: "PENDING" }),
    );

    expect(
      await screen.findByText("Thanh toán chưa thành công"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Thử lại, còn 2 lần/i }),
    ).toBeInTheDocument();
  });

  it("asks for nothing during five minutes while the stream is open (AC-8)", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      vi.mocked(checkoutService.getOrder).mockResolvedValue(mockOrder);
      vi.mocked(checkoutService.getOrderPayments).mockResolvedValue(
        mockPayments,
      );

      renderWithProviders(<PaymentPage />);
      await screen.findByText("Quét mã QR để thanh toán");
      act(() =>
        streams[0].onMessage("status", {
          orderId: "ord-123",
          status: "PAYMENT_PROCESSING",
        }),
      );
      await act(() => vi.advanceTimersByTimeAsync(100));
      const orderReads = vi.mocked(checkoutService.getOrder).mock.calls.length;
      const paymentReads = vi.mocked(checkoutService.getOrderPayments).mock
        .calls.length;

      await act(() => vi.advanceTimersByTimeAsync(5 * 60_000));

      expect(vi.mocked(checkoutService.getOrder)).toHaveBeenCalledTimes(
        orderReads,
      );
      expect(vi.mocked(checkoutService.getOrderPayments)).toHaveBeenCalledTimes(
        paymentReads,
      );
    } finally {
      vi.useRealTimers();
    }
  });
});
