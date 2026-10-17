import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import type { OrderItem } from "@/types";
import { OrderItemsList } from "./OrderItemsList.tsx";

const mockItems: OrderItem[] = [
  {
    skuId: "sku-1",
    productName: "Tai nghe không dây Aero 2",
    thumbnail: null,
    quantity: 1,
    unitPrice: 200000,
    price: 200000,
  },
];

describe("OrderItemsList (AC-11)", () => {
  it("renders order items, subtotal, shipping free, and total without voucher (AC-11)", () => {
    render(
      <OrderItemsList
        items={mockItems}
        subtotal={200000}
        shippingFee={0}
        total={200000}
      />,
    );

    expect(screen.getByText("Tai nghe không dây Aero 2")).toBeInTheDocument();
    expect(screen.getByText("Tạm tính")).toBeInTheDocument();
    expect(screen.getByText("Vận chuyển")).toBeInTheDocument();
    expect(screen.getByText("Miễn phí")).toBeInTheDocument();
    expect(screen.getByText("Tổng cộng")).toBeInTheDocument();
    expect(screen.getAllByText("200.000 ₫")).toHaveLength(3);
    expect(screen.queryByText(/Mã giảm giá/i)).not.toBeInTheDocument();
  });

  it("renders discount row with voucher code and discount amount when voucher is used (AC-11)", () => {
    render(
      <OrderItemsList
        items={mockItems}
        subtotal={200000}
        shippingFee={0}
        total={150000}
        discountAmount={50000}
        voucherCode="GIAM50K"
      />,
    );

    expect(screen.getByText("Mã giảm giá (GIAM50K)")).toBeInTheDocument();
    const discountValue = screen.getByText("−50.000 ₫");
    expect(discountValue).toBeInTheDocument();
    expect(discountValue).toHaveClass("text-ok");
    expect(screen.getByText("150.000 ₫")).toBeInTheDocument();
  });

  it("renders discount row without code when voucherCode is null (AC-11)", () => {
    render(
      <OrderItemsList
        items={mockItems}
        subtotal={200000}
        shippingFee={0}
        total={170000}
        discountAmount={30000}
        voucherCode={null}
      />,
    );

    expect(screen.getByText("Mã giảm giá")).toBeInTheDocument();
    expect(screen.getByText("−30.000 ₫")).toBeInTheDocument();
  });

  it("renders shipping fee when shippingFee > 0", () => {
    render(
      <OrderItemsList
        items={mockItems}
        subtotal={200000}
        shippingFee={30000}
        total={180000}
        discountAmount={50000}
        voucherCode="GIAM50K"
      />,
    );

    expect(screen.getByText("30.000 ₫")).toBeInTheDocument();
    expect(screen.queryByText("Miễn phí")).not.toBeInTheDocument();
  });
});
