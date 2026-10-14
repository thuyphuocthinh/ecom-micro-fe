import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductGallery, type GalleryImage } from "./ProductGallery.tsx";

const mockImages: GalleryImage[] = [
  { url: "https://example.com/front.jpg", label: "Mặt trước" },
  { url: "https://example.com/side.jpg", label: "Cận cảnh chi tiết" },
  { url: "https://example.com/box.jpg", label: "Bao bì hộp đựng" },
];

describe("ProductGallery (AC-2)", () => {
  it("renders main image and sale tag correctly", () => {
    render(
      <ProductGallery
        productName="Tai nghe Aero 2"
        images={mockImages}
        activeIndex={0}
        onSelectImage={vi.fn()}
        onSale={true}
        discountBadge="-15%"
      />,
    );

    expect(
      screen.getByRole("img", { name: "Tai nghe Aero 2 - Mặt trước" }),
    ).toBeInTheDocument();
    expect(screen.getByText("-15%")).toBeInTheDocument();
    expect(
      screen.getByText("Ảnh minh hoạ. Ảnh thật của sản phẩm sẽ thay vào đây."),
    ).toBeInTheDocument();
  });

  it("renders thumbnails group and highlights active thumbnail", () => {
    render(
      <ProductGallery
        productName="Tai nghe Aero 2"
        images={mockImages}
        activeIndex={1}
        onSelectImage={vi.fn()}
      />,
    );

    const group = screen.getByRole("group", { name: "Chọn ảnh" });
    expect(group).toBeInTheDocument();

    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(3);

    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[2]).toHaveAttribute("aria-pressed", "false");
  });

  it("calls onSelectImage when clicking a thumbnail", async () => {
    const handleSelectImage = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductGallery
        productName="Tai nghe Aero 2"
        images={mockImages}
        activeIndex={0}
        onSelectImage={handleSelectImage}
      />,
    );

    const buttons = screen.getAllByRole("button");
    await user.click(buttons[2]);

    expect(handleSelectImage).toHaveBeenCalledWith(2);
  });
});
