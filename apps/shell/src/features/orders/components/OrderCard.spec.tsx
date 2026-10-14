import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { OrderCard } from "./OrderCard.tsx";
import type { OrderSummary } from "@/types";

const mockOrder: OrderSummary = {
  id: "3fa85f64-0000-0000-0000-000000000000",
  status: "CONFIRMED",
  paymentMethod: "ONLINE",
  total: 4929000,
  itemCount: 3,
  items: [
    { productName: "Tai nghe không dây Aero 2", thumbnail: null, quantity: 1 },
    { productName: "Áo thun cotton", thumbnail: null, quantity: 1 },
    { productName: "Sạc nhanh GaN 65W", thumbnail: null, quantity: 1 },
  ],
  createdAt: "2026-10-11T10:05:00.000Z",
};

describe("OrderCard", () => {
  it("renders order code, status badge, summary, and total", () => {
    render(
      <MemoryRouter>
        <OrderCard order={mockOrder} />
      </MemoryRouter>,
    );

    expect(screen.getByText("#3FA85F64")).toBeInTheDocument();
    expect(screen.getByText("Đã xác nhận")).toBeInTheDocument();
    expect(
      screen.getByText(/Tai nghe không dây Aero 2 và 2 sản phẩm khác/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/4\.929\.000/)).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", async () => {
    const handleCancel = vi.fn();
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <OrderCard order={mockOrder} onCancel={handleCancel} />
      </MemoryRouter>,
    );

    const cancelBtn = screen.getByRole("button", { name: "Huỷ đơn" });
    expect(cancelBtn).toBeInTheDocument();

    await user.click(cancelBtn);
    expect(handleCancel).toHaveBeenCalledWith(mockOrder);
  });

  it("renders payment countdown when in PAYMENT_PROCESSING", () => {
    const waitingOrder: OrderSummary = {
      ...mockOrder,
      id: "b27c91d0-0000-0000-0000-000000000000",
      status: "PAYMENT_PROCESSING",
      expiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
    };

    render(
      <MemoryRouter>
        <OrderCard order={waitingOrder} />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Còn 12 phút để thanh toán, sau đó đơn tự huỷ/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Thanh toán ngay" }),
    ).toBeInTheDocument();
  });

  it("renders 'Mua lại' button when order is DELIVERED", () => {
    const deliveredOrder: OrderSummary = {
      ...mockOrder,
      status: "DELIVERED",
    };

    render(
      <MemoryRouter>
        <OrderCard order={deliveredOrder} />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Mua lại" })).toBeInTheDocument();
  });
});
