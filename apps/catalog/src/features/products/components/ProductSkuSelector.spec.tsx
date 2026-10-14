import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductSkuSelector } from "./ProductSkuSelector.tsx";
import type { Sku } from "@/types";

const mockSkus: Sku[] = [
  {
    id: "sku-1",
    skuCode: "AERO-BLK",
    name: "Xanh đen",
    price: 3990000,
    inStock: true,
    attributes: { color: "Xanh đen", hex: "#101828" },
  },
  {
    id: "sku-2",
    skuCode: "AERO-WHT",
    name: "Trắng ngà",
    price: 3990000,
    inStock: true,
    stock: 3,
    attributes: { color: "Trắng ngà", hex: "#f4f1ea" },
  },
  {
    id: "sku-3",
    skuCode: "AERO-BLU",
    name: "Xanh lam",
    price: 4190000,
    inStock: false,
    stock: 0,
    attributes: { color: "Xanh lam", hex: "#2f6fed" },
  },
];

describe("ProductSkuSelector (AC-3, AC-8)", () => {
  it("renders fieldset legend with selected variant name", () => {
    render(
      <ProductSkuSelector
        skus={mockSkus}
        selectedSkuId="sku-1"
        onSelectSku={vi.fn()}
      />,
    );

    expect(screen.getByText("Màu sắc:")).toBeInTheDocument();
    expect(screen.getAllByText("Xanh đen").length).toBeGreaterThanOrEqual(1);
  });

  it("renders all SKUs and marks out of stock item with '· Hết hàng'", () => {
    render(
      <ProductSkuSelector
        skus={mockSkus}
        selectedSkuId="sku-1"
        onSelectSku={vi.fn()}
      />,
    );

    expect(screen.getByText("Trắng ngà")).toBeInTheDocument();
    expect(screen.getByText("Xanh lam")).toBeInTheDocument();
    expect(screen.getByText("· Hết hàng")).toBeInTheDocument();
  });

  it("calls onSelectSku when user clicks another SKU", async () => {
    const handleSelectSku = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductSkuSelector
        skus={mockSkus}
        selectedSkuId="sku-1"
        onSelectSku={handleSelectSku}
      />,
    );

    const whiteOption = screen.getByLabelText("Trắng ngà");
    await user.click(whiteOption);

    expect(handleSelectSku).toHaveBeenCalledWith("sku-2");
  });

  it("returns null when skus has 1 or fewer items", () => {
    const { container } = render(
      <ProductSkuSelector
        skus={[mockSkus[0]]}
        selectedSkuId="sku-1"
        onSelectSku={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
