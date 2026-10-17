import { describe, it, expect, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import type { VoucherPreview } from "@/types";
import { CartOrderSummary, type CartVoucherView } from "./CartOrderSummary.tsx";

const PREVIEW: VoucherPreview = {
  code: "GIAM50K",
  name: "Giảm 50 nghìn",
  discountType: "FIXED_AMOUNT",
  discountAmount: 50000,
  subtotal: 1000000,
  total: 950000,
};

const voucherView = (
  overrides: Partial<CartVoucherView> = {},
): CartVoucherView => ({
  appliedCode: null,
  preview: undefined,
  isChecking: false,
  errorMessage: null,
  vouchers: [],
  listState: "ready",
  onOpenList: vi.fn(),
  onSelect: vi.fn(),
  onRemove: vi.fn(),
  ...overrides,
});

function renderSummary(
  props: Partial<React.ComponentProps<typeof CartOrderSummary>> = {},
) {
  return render(
    <MemoryRouter>
      <CartOrderSummary subtotal={1000000} voucher={voucherView()} {...props} />
    </MemoryRouter>,
  );
}

describe("CartOrderSummary", () => {
  it("renders subtotal, shipping free, total, and checkout link", () => {
    renderSummary();

    expect(screen.getByText("Tóm tắt đơn hàng")).toBeInTheDocument();
    expect(screen.getByText("Tạm tính")).toBeInTheDocument();
    expect(screen.getAllByText("1.000.000 ₫")).toHaveLength(2);
    expect(screen.getByText("Miễn phí")).toBeInTheDocument();
    expect(screen.getByText("Tổng cộng")).toBeInTheDocument();

    const checkoutBtn = screen.getByRole("link", {
      name: "Tiến hành đặt hàng",
    });
    expect(checkoutBtn).toHaveAttribute("href", "/checkout");
    expect(
      screen.getByText(/Hàng chưa được giữ cho bạn cho tới khi bạn đặt hàng/i),
    ).toBeInTheDocument();
  });

  it("without a voucher there is no discount line, and the old made-up sample code is gone", () => {
    renderSummary();

    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    expect(screen.queryByText(/ECOM50K/)).not.toBeInTheDocument();
    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("with a voucher it shows the line, and the total is the one the SERVER gave (AC-14)", () => {
    renderSummary({
      voucher: voucherView({ appliedCode: "GIAM50K", preview: PREVIEW }),
    });

    const line = screen.getByText("Mã giảm giá (GIAM50K)");
    expect(line.nextElementSibling).toHaveTextContent("−50.000 ₫");
    expect(line.nextElementSibling).toHaveClass("text-ok");
    expect(screen.getByText("950.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Đã áp dụng mã GIAM50K.")).toBeInTheDocument();
  });

  it("never subtracts by itself: the total shown is the server's, even when it is not subtotal minus discount", () => {
    // The server keeps at least 1.000 ₫ to pay, so its total is not always a plain subtraction
    renderSummary({
      subtotal: 40000,
      voucher: voucherView({
        appliedCode: "GIAM50K",
        preview: {
          ...PREVIEW,
          subtotal: 40000,
          discountAmount: 39000,
          total: 1000,
        },
      }),
    });

    expect(screen.getByText("−39.000 ₫")).toBeInTheDocument();
    const total = screen.getByText("Tổng cộng").nextElementSibling;
    expect(total).toHaveTextContent("1.000 ₫");
  });

  it("while a code is being checked for the first time the total is the subtotal and the line says so", () => {
    renderSummary({
      voucher: voucherView({ appliedCode: "GIAM50K", isChecking: true }),
    });

    expect(screen.getByText("Đang kiểm tra mã…")).toBeInTheDocument();
    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    const total = screen.getByText("Tổng cộng").nextElementSibling;
    expect(total).toHaveTextContent("1.000.000 ₫");
  });

  it("while it is asked again after the cart changed, the last numbers stay, dimmed, and do not flash back", () => {
    const { container } = renderSummary({
      voucher: voucherView({
        appliedCode: "GIAM50K",
        preview: PREVIEW,
        isChecking: true,
      }),
    });

    const breakdown = container.querySelector("dl") as HTMLElement;
    expect(breakdown).toHaveAttribute("aria-busy", "true");
    expect(breakdown).toHaveClass("opacity-60");
    expect(within(breakdown).getByText("950.000 ₫")).toBeInTheDocument();
  });

  it("a code the server refused: the sentence shows, no discount, the total is the subtotal", () => {
    renderSummary({
      voucher: voucherView({
        errorMessage: "Mã giảm giá này đã hết lượt dùng.",
      }),
    });

    expect(
      screen.getByText("Mã giảm giá này đã hết lượt dùng."),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    const total = screen.getByText("Tổng cộng").nextElementSibling;
    expect(total).toHaveTextContent("1.000.000 ₫");
  });

  it("the discount and the total are read out when they change (aria-live)", () => {
    renderSummary({
      voucher: voucherView({ appliedCode: "GIAM50K", preview: PREVIEW }),
    });

    expect(screen.getByText("−50.000 ₫")).toHaveAttribute(
      "aria-live",
      "polite",
    );
    expect(screen.getByText("950.000 ₫")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("a guest gets the plain breakdown, whatever code may be left over, and is told to sign in", () => {
    renderSummary({
      isGuest: true,
      voucher: voucherView({ appliedCode: "GIAM50K", preview: PREVIEW }),
    });

    expect(screen.queryByText(/Mã giảm giá \(/)).not.toBeInTheDocument();
    expect(screen.getAllByText("1.000.000 ₫")).toHaveLength(2);
    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(
      screen.getByText(/Đăng nhập để dùng mã giảm giá\./),
    ).toBeInTheDocument();
  });
});
