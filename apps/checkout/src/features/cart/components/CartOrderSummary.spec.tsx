import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router";
import { CartOrderSummary } from "./CartOrderSummary.tsx";

describe("CartOrderSummary", () => {
  it("renders subtotal, shipping free, total, and checkout link", () => {
    render(
      <MemoryRouter>
        <CartOrderSummary
          subtotal={1000000}
          couponCode=""
          discountAmount={0}
          onApplyCoupon={vi.fn()}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Tóm tắt đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Tạm tính")).toBeInTheDocument();
    expect(screen.getAllByText("1.000.000 ₫")).toHaveLength(2);
    expect(screen.getByText("Miễn phí")).toBeInTheDocument();
    expect(screen.getByText("Tổng cộng")).toBeInTheDocument();

    const checkoutBtn = screen.getByRole("link", {
      name: "Tiến hành đặt hàng",
    });
    expect(checkoutBtn).toBeInTheDocument();
    expect(checkoutBtn).toHaveAttribute("href", "/checkout");

    expect(
      screen.getByText(/Hàng chưa được giữ cho bạn cho tới khi bạn đặt hàng/i),
    ).toBeInTheDocument();
  });

  it("handles valid coupon application and displays discount", async () => {
    const user = userEvent.setup();
    const handleApply = vi.fn().mockReturnValue(true);

    const { rerender } = render(
      <MemoryRouter>
        <CartOrderSummary
          subtotal={1000000}
          couponCode=""
          discountAmount={0}
          onApplyCoupon={handleApply}
        />
      </MemoryRouter>,
    );

    const couponInput = screen.getByPlaceholderText("Ví dụ: ECOM50K…");
    const applyBtn = screen.getByRole("button", { name: "Áp dụng" });

    await user.type(couponInput, "ecom50k");
    await user.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith("ECOM50K");

    // Re-render with applied coupon
    rerender(
      <MemoryRouter>
        <CartOrderSummary
          subtotal={1000000}
          couponCode="ECOM50K"
          discountAmount={50000}
          onApplyCoupon={handleApply}
        />
      </MemoryRouter>,
    );

    expect(screen.getByText("Đã áp dụng mã ECOM50K.")).toBeInTheDocument();
    expect(screen.getByText("−50.000 ₫")).toBeInTheDocument();
    // 1.000.000 - 50.000 = 950.000
    expect(screen.getByText("950.000 ₫")).toBeInTheDocument();
  });

  it("displays error message when an invalid coupon is entered", async () => {
    const user = userEvent.setup();
    const handleApply = vi.fn().mockReturnValue(false);

    render(
      <MemoryRouter>
        <CartOrderSummary
          subtotal={500000}
          couponCode=""
          discountAmount={0}
          onApplyCoupon={handleApply}
        />
      </MemoryRouter>,
    );

    const couponInput = screen.getByPlaceholderText("Ví dụ: ECOM50K…");
    const applyBtn = screen.getByRole("button", { name: "Áp dụng" });

    await user.type(couponInput, "INVALIDCODE");
    await user.click(applyBtn);

    expect(handleApply).toHaveBeenCalledWith("INVALIDCODE");
    expect(
      screen.getByText(
        "Mã không đúng hoặc đã hết hạn. Kiểm tra lại mã rồi thử lần nữa.",
      ),
    ).toBeInTheDocument();
  });

  it("applies coupon on Enter key press in input", async () => {
    const user = userEvent.setup();
    const handleApply = vi.fn().mockReturnValue(true);

    render(
      <MemoryRouter>
        <CartOrderSummary
          subtotal={500000}
          couponCode=""
          discountAmount={0}
          onApplyCoupon={handleApply}
        />
      </MemoryRouter>,
    );

    const couponInput = screen.getByPlaceholderText("Ví dụ: ECOM50K…");
    await user.type(couponInput, "ECOM50K{Enter}");

    expect(handleApply).toHaveBeenCalledWith("ECOM50K");
  });
});
