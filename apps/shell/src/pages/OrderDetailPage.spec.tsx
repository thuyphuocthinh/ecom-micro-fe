import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile, OrderDetail } from "@/types";
import { OrderDetailPage } from "./OrderDetailPage.tsx";

const mockUser: UserProfile = {
  id: "u-123",
  email: "customer@example.com",
  displayName: "Nguyễn Văn A",
  role: "CUSTOMER",
  avatarUrl: null,
  hasPassword: true,
  googleLinked: false,
  createdAt: "2026-10-14T08:00:00.000Z",
};

const mockOrderDetail: OrderDetail = {
  id: "b27c91d0-0000-0000-0000-000000000001",
  status: "CONFIRMED",
  paymentMethod: "ONLINE",
  subtotal: 4929000,
  shippingFee: 0,
  total: 4929000,
  items: [
    {
      skuId: "sku-1",
      productName: "Tai nghe không dây Aero 2",
      thumbnail: null,
      quantity: 1,
      price: 3990000,
      unitPrice: 3990000,
    },
    {
      skuId: "sku-2",
      productName: "Áo thun cotton",
      thumbnail: null,
      quantity: 1,
      price: 249000,
      unitPrice: 249000,
    },
    {
      skuId: "sku-3",
      productName: "Sạc nhanh GaN 65W",
      thumbnail: null,
      quantity: 1,
      price: 690000,
      unitPrice: 690000,
    },
  ],
  shippingAddress: {
    recipientName: "Nguyễn Văn A",
    phone: "0901234567",
    street: "12 Đường Thử",
    wardName: "Phường Thử Nghiệm",
    districtName: "Quận Thử Nghiệm",
    provinceName: "TP. Hồ Chí Minh",
  },
  timeline: {
    confirmedAt: "2026-10-11T10:05:00.000Z",
  },
  payments: [
    {
      id: "pay-1",
      attemptNumber: 1,
      status: "SUCCESS",
      createdAt: "2026-10-11T10:05:00.000Z",
    },
  ],
  createdAt: "2026-10-11T10:05:00.000Z",
  updatedAt: "2026-10-11T10:05:00.000Z",
};

function createAuthContext(): AuthContextValue {
  return {
    status: "signedIn",
    user: mockUser,
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function renderOrderDetailPage(orderId = mockOrderDetail.id) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={createAuthContext()}>
        <MemoryRouter initialEntries={[`/account/orders/${orderId}`]}>
          <Routes>
            <Route path="/account/orders/:id" element={<OrderDetailPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("OrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders order detail with breadcrumb, timeline, items, shipping and payment info", async () => {
    vi.spyOn(api, "get").mockResolvedValue(mockOrderDetail as never);

    renderOrderDetailPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Đơn #B27C91D0/i }),
      ).toBeInTheDocument();
      expect(screen.getByText("Hành trình đơn hàng")).toBeInTheDocument();
      expect(screen.getByText("Tai nghe không dây Aero 2")).toBeInTheDocument();
      expect(screen.getByText("Nguyễn Văn A")).toBeInTheDocument();
      expect(screen.getByText("0901234567")).toBeInTheDocument();
      expect(screen.getByText("Thanh toán trực tuyến")).toBeInTheDocument();
    });

    expect(
      screen.getByRole("link", { name: "Đơn hàng của tôi" }),
    ).toBeInTheDocument();
  });

  it("renders not found state when API returns error", async () => {
    vi.spyOn(api, "get").mockRejectedValue(new Error("Not found"));

    renderOrderDetailPage("unknown-id");

    await waitFor(() => {
      expect(screen.getByText("Không tìm thấy đơn hàng")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Quay lại danh sách đơn hàng" }),
      ).toBeInTheDocument();
    });
  });

  it("renders cancelled banner when order is cancelled", async () => {
    const cancelledDetail: OrderDetail = {
      ...mockOrderDetail,
      status: "CANCELLED",
    };
    vi.spyOn(api, "get").mockResolvedValue(cancelledDetail as never);

    renderOrderDetailPage();

    await waitFor(() => {
      expect(screen.getByText("Đơn hàng đã được huỷ")).toBeInTheDocument();
    });
  });

  it("cancels an order through the modal", async () => {
    const user = userEvent.setup();
    vi.spyOn(api, "get").mockResolvedValue(mockOrderDetail as never);
    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValue({ success: true } as never);

    renderOrderDetailPage();

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Đơn #B27C91D0/i }),
      ).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole("button", { name: "Huỷ đơn" });
    await user.click(cancelBtn);

    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toBeInTheDocument();

    const confirmBtn = screen
      .getAllByRole("button", { name: "Huỷ đơn" })
      .find((btn) => btn.closest('[role="alertdialog"]'));
    await user.click(confirmBtn!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/orders/{id}/cancel", {
        params: { id: mockOrderDetail.id },
      });
    });
  });
});
