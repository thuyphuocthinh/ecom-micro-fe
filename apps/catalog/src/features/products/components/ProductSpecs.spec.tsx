import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProductSpecs } from "./ProductSpecs.tsx";
import type { ProductSpecItem } from "@/features/products/utils/product-detail-format.ts";

const mockSpecs: ProductSpecItem[] = [
  { label: "Kiểu đeo", value: "Chụp tai" },
  { label: "Kết nối", value: "Bluetooth 5.3" },
  { label: "Thời lượng pin", value: "Tới 40 giờ" },
];

describe("ProductSpecs (AC-9)", () => {
  it("renders description and specifications sections correctly", () => {
    render(
      <ProductSpecs
        description="Tai nghe chụp tai không dây, chống ồn chủ động.\n\nDùng được qua Bluetooth hoặc dây khi hết pin."
        specs={mockSpecs}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Mô tả sản phẩm" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Tai nghe chụp tai không dây/)).toBeInTheDocument();
    expect(
      screen.getByText(/Dùng được qua Bluetooth hoặc dây/),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("heading", { name: "Thông số" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Kiểu đeo")).toBeInTheDocument();
    expect(screen.getByText("Chụp tai")).toBeInTheDocument();
    expect(screen.getByText("Thời lượng pin")).toBeInTheDocument();
    expect(screen.getByText("Tới 40 giờ")).toBeInTheDocument();
  });

  it("handles fallback description if none provided", () => {
    render(<ProductSpecs description={null} specs={mockSpecs} />);

    expect(
      screen.getByText("Thông tin chi tiết của sản phẩm đang được cập nhật."),
    ).toBeInTheDocument();
  });
});
