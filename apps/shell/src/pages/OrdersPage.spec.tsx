import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { api } from "@ecom/api";
import { AuthContext, type AuthContextValue } from "@/features/auth";
import type { UserProfile, OrderCounts, OrderSummary } from "@/types";
import { OrdersPage } from "./OrdersPage.tsx";

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

const mockCounts: OrderCounts = {
  PENDING: 1,
  PAYMENT_PROCESSING: 1,
  CONFIRMED: 2,
  SHIPPING: 1,
  DELIVERED: 3,
  CANCELLED: 1,
  EXPIRED: 0,
};

const mockOrders: OrderSummary[] = [
  {
    id: "3fa85f64-0000-0000-0000-000000000001",
    status: "CONFIRMED",
    paymentMethod: "ONLINE",
    total: 4929000,
    itemCount: 2,
    items: [
      { productName: "Tai nghe Aero 2", thumbnail: null, quantity: 1 },
      { productName: "Cáp sạc GaN", thumbnail: null, quantity: 1 },
    ],
    createdAt: "2026-10-11T10:05:00.000Z",
  },
  {
    id: "b27c91d0-0000-0000-0000-000000000002",
    status: "DELIVERED",
    paymentMethod: "COD",
    total: 640000,
    itemCount: 1,
    items: [
      { productName: "Bình giữ nhiệt 500ml", thumbnail: null, quantity: 2 },
    ],
    createdAt: "2026-10-02T08:00:00.000Z",
  },
];

function createAuthContext(
  user: UserProfile | null = mockUser,
): AuthContextValue {
  return {
    status: user ? "signedIn" : "guest",
    user,
    cartCount: 0,
    login: vi.fn(),
    logout: vi.fn(),
  };
}

function renderOrdersPage(initialEntry = "/account/orders") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={createAuthContext()}>
        <MemoryRouter initialEntries={[initialEntry]}>
          <Routes>
            <Route path="/account/orders" element={<OrdersPage />} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  );
}

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page title and orders list with counts", async () => {
    vi.spyOn(api, "get").mockImplementation((async (url: string) => {
      if (url.includes("counts")) {
        return { data: mockCounts };
      }
      if (url.includes("orders")) {
        return { data: mockOrders, meta: { hasMore: false } };
      }
      return {};
    }) as never);

    renderOrdersPage();

    await waitFor(
      () => {
        expect(
          screen.getByRole("heading", { name: "Đơn hàng của tôi" }),
        ).toBeInTheDocument();
        expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
        expect(screen.getByText("#B27C91D0")).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Tất cả 9/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Đã xác nhận 2/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole("button", { name: /Đã giao 3/i }),
        ).toBeInTheDocument();
      },
      { timeout: 4000 },
    );
  });

  it("renders empty state when there are no orders", async () => {
    vi.spyOn(api, "get").mockImplementation((async (url: string) => {
      if (url.includes("counts")) {
        return { ...mockCounts, CONFIRMED: 0 };
      }
      if (url.includes("orders")) {
        return { data: [], meta: { hasMore: false } };
      }
      return {};
    }) as never);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText("Chưa có đơn nào ở mục này")).toBeInTheDocument();
      expect(
        screen.getByRole("link", { name: "Bắt đầu mua sắm" }),
      ).toBeInTheDocument();
    });
  });

  it("cancels an order through the alertdialog confirmation", async () => {
    const user = userEvent.setup();

    vi.spyOn(api, "get").mockImplementation((async (url: string) => {
      if (url.includes("counts")) return mockCounts;
      if (url.includes("orders"))
        return { data: [mockOrders[0]], meta: { hasMore: false } };
      return {};
    }) as never);

    const postSpy = vi
      .spyOn(api, "post")
      .mockResolvedValue({ success: true } as never);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
    });

    const cancelBtn = screen.getByRole("button", { name: "Huỷ đơn" });
    await user.click(cancelBtn);

    // Modal opens
    const dialog = await screen.findByRole("alertdialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText(/Huỷ đơn #3FA85F64\?/i)).toBeInTheDocument();

    // Confirm cancel
    const confirmCancelBtn = screen
      .getAllByRole("button", { name: "Huỷ đơn" })
      .find((btn) => btn.closest('[role="alertdialog"]'));
    expect(confirmCancelBtn).toBeDefined();
    await user.click(confirmCancelBtn!);

    await waitFor(() => {
      expect(postSpy).toHaveBeenCalledWith("/orders/{id}/cancel", {
        params: { id: mockOrders[0].id },
      });
    });
  });

  it("filters orders and counts by custom date range through popup and calls API", async () => {
    const user = userEvent.setup();

    const getSpy = vi.spyOn(api, "get").mockImplementation((async (
      url: string,
    ) => {
      if (url.includes("counts")) return { data: mockCounts };
      if (url.includes("orders"))
        return { data: mockOrders, meta: { hasMore: false } };
      return {};
    }) as never);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
    });

    // Click dropdown to choose custom date range
    const dropdownTrigger = screen.getByRole("button", {
      name: /Thời gian đặt/i,
    });
    await user.click(dropdownTrigger);

    const customOption = await screen.findByRole("option", {
      name: "Chọn khoảng ngày…",
    });
    await user.click(customOption);

    // DateRangePicker dialog opens
    const dialog = await screen.findByRole("dialog", {
      name: "Chọn khoảng ngày",
    });
    expect(dialog).toBeInTheDocument();

    // Fill from and to
    const fromInput = screen.getByLabelText("Từ ngày");
    const toInput = screen.getByLabelText("Đến ngày");
    await user.type(fromInput, "2026-10-01");
    await user.type(toInput, "2026-10-14");

    // Click Áp dụng
    const applyBtn = screen.getByRole("button", { name: "Áp dụng" });
    await user.click(applyBtn);

    // Verify dialog closes
    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // Verify API called with createdFrom and createdTo
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        "/orders",
        expect.objectContaining({
          query: expect.objectContaining({
            createdFrom: expect.any(String),
            createdTo: expect.any(String),
          }),
        }),
      );
      expect(getSpy).toHaveBeenCalledWith(
        "/orders/counts",
        expect.objectContaining({
          query: expect.objectContaining({
            createdFrom: expect.any(String),
            createdTo: expect.any(String),
          }),
        }),
      );
    });
  });

  it("filters orders by 30 days preset and resets on clear filters", async () => {
    const user = userEvent.setup();

    const getSpy = vi.spyOn(api, "get").mockImplementation((async (
      url: string,
    ) => {
      if (url.includes("counts")) return { data: mockCounts };
      if (url.includes("orders"))
        return { data: mockOrders, meta: { hasMore: false } };
      return {};
    }) as never);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
    });

    // Select 30 days from dropdown
    const dropdownTrigger = screen.getByRole("button", {
      name: /Thời gian đặt/i,
    });
    await user.click(dropdownTrigger);

    const option30d = await screen.findByRole("option", {
      name: "30 ngày qua",
    });
    await user.click(option30d);

    // Verify API called with createdFrom for 30d
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        "/orders",
        expect.objectContaining({
          query: expect.objectContaining({
            createdFrom: expect.any(String),
          }),
        }),
      );
    });

    // Clear filters button appears
    const clearBtn = await screen.findByRole("button", {
      name: "Xoá bộ lọc",
    });
    expect(clearBtn).toBeInTheDocument();
    await user.click(clearBtn);

    // Verify clear filters calls API with empty params
    await waitFor(() => {
      expect(getSpy).toHaveBeenCalledWith(
        "/orders",
        expect.objectContaining({
          query: expect.not.objectContaining({
            createdFrom: expect.anything(),
          }),
        }),
      );
    });
  });

  it("fetches next page with cursor when clicking Xem thêm đơn hàng", async () => {
    const user = userEvent.setup();

    const getSpy = vi.spyOn(api, "get").mockImplementation((async (
      url: string,
      config?: { query?: Record<string, unknown> },
    ) => {
      if (url.includes("counts")) return { data: mockCounts };
      if (url.includes("orders")) {
        if (config?.query?.cursor === "cursor-page-2") {
          return {
            data: [
              {
                id: "44444444-0000-0000-0000-000000000004",
                status: "DELIVERED",
                paymentMethod: "COD",
                total: 100000,
                itemCount: 1,
                items: [
                  {
                    productName: "Sản phẩm trang 2",
                    thumbnail: null,
                    quantity: 1,
                  },
                ],
                createdAt: "2026-10-01T08:00:00.000Z",
              },
            ],
            meta: { hasMore: false },
          };
        }
        return {
          data: [mockOrders[0]],
          meta: { nextCursor: "cursor-page-2", hasMore: true },
        };
      }
      return {};
    }) as never);

    renderOrdersPage();

    await waitFor(() => {
      expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
    });

    // "Xem thêm đơn hàng" button is visible
    const showMoreBtn = await screen.findByRole("button", {
      name: "Xem thêm đơn hàng",
    });
    expect(showMoreBtn).toBeInTheDocument();

    await user.click(showMoreBtn);

    // Page 2 order appears
    await waitFor(() => {
      expect(screen.getByText("#44444444")).toBeInTheDocument();
    });

    // Button disappears because hasMore is now false
    expect(
      screen.queryByRole("button", { name: "Xem thêm đơn hàng" }),
    ).not.toBeInTheDocument();

    // Verify api was called with cursor
    expect(getSpy).toHaveBeenCalledWith(
      "/orders",
      expect.objectContaining({
        query: expect.objectContaining({
          cursor: "cursor-page-2",
        }),
      }),
    );
  });
});
