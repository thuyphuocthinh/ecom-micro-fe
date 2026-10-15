import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
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

    const buttons = within(group).getAllByRole("button");
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

    const buttons = within(
      screen.getByRole("group", { name: "Chọn ảnh" }),
    ).getAllByRole("button");
    await user.click(buttons[2]);

    expect(handleSelectImage).toHaveBeenCalledWith(2);
  });

  it("loads the big photo first (eager, high priority) and the thumbnails lazily (AC-2)", () => {
    render(
      <ProductGallery
        productName="Tai nghe Aero 2"
        images={mockImages}
        activeIndex={0}
        onSelectImage={vi.fn()}
        onSale={false}
        discountBadge=""
      />,
    );

    const main = screen.getByRole("img", {
      name: "Tai nghe Aero 2 - Mặt trước",
    });
    expect(main).toHaveAttribute("loading", "eager");
    expect(main).toHaveAttribute("fetchpriority", "high");

    const thumbnails = screen
      .getAllByRole("img")
      .filter((img) => img !== main && img.tagName === "IMG");
    expect(thumbnails.length).toBeGreaterThan(0);
    for (const thumbnail of thumbnails) {
      expect(thumbnail).toHaveAttribute("loading", "lazy");
    }
  });
});

/** The gallery with the state a product page keeps for it. */
function GalleryPage({
  images = mockImages,
  start = 0,
  onSelect,
}: {
  images?: GalleryImage[];
  start?: number;
  onSelect?: (index: number) => void;
}) {
  const [active, setActive] = useState(start);
  return (
    <ProductGallery
      productName="Tai nghe Aero 2"
      images={images}
      activeIndex={active}
      onSelectImage={(index) => {
        setActive(index);
        onSelect?.(index);
      }}
    />
  );
}

async function waitUntilClosed() {
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
}

describe("ProductGallery popup (AC-1, AC-2, AC-6, AC-8)", () => {
  it("opens the popup at the photo on show when the big photo is clicked (AC-1)", async () => {
    const user = userEvent.setup();
    render(<GalleryPage start={1} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Phóng to ảnh" }));

    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();
  });

  it("gives focus back to the big photo when the popup closes (AC-2)", async () => {
    const user = userEvent.setup();
    render(<GalleryPage />);
    const opener = screen.getByRole("button", { name: "Phóng to ảnh" });

    await user.click(opener);
    await screen.findByRole("dialog");
    await user.keyboard("{Escape}");
    await waitUntilClosed();

    expect(opener).toHaveFocus();
  });

  it("makes the big photo follow the photo last looked at in the popup (AC-6)", async () => {
    const user = userEvent.setup();
    const selected: number[] = [];
    render(<GalleryPage start={0} onSelect={(i) => selected.push(i)} />);

    await user.click(screen.getByRole("button", { name: "Phóng to ảnh" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitUntilClosed();

    expect(selected.at(-1)).toBe(2);
    expect(
      screen.getByRole("img", { name: "Tai nghe Aero 2 - Bao bì hộp đựng" }),
    ).toBeInTheDocument();
    const thumbnails = within(
      screen.getByRole("group", { name: "Chọn ảnh" }),
    ).getAllByRole("button");
    expect(thumbnails[2]).toHaveAttribute("aria-pressed", "true");
    expect(thumbnails[0]).toHaveAttribute("aria-pressed", "false");
  });

  it("does not move the big photo just because the popup was opened and closed", async () => {
    const user = userEvent.setup();
    const selected: number[] = [];
    render(<GalleryPage start={1} onSelect={(i) => selected.push(i)} />);

    await user.click(screen.getByRole("button", { name: "Phóng to ảnh" }));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitUntilClosed();

    expect(
      screen.getByRole("img", { name: "Tai nghe Aero 2 - Cận cảnh chi tiết" }),
    ).toBeInTheDocument();
    expect(selected.every((i) => i === 1)).toBe(true);
  });

  it("shows a single photo with no arrows and still opens (AC-7)", async () => {
    const user = userEvent.setup();
    render(<GalleryPage images={[mockImages[0]]} />);

    await user.click(screen.getByRole("button", { name: "Phóng to ảnh" }));
    const dialog = await screen.findByRole("dialog");
    expect(
      within(dialog).queryByRole("button", { name: "Ảnh sau" }),
    ).not.toBeInTheDocument();
  });

  it("is not a button when the product has no photo with an address (AC-8)", () => {
    render(
      <GalleryPage
        images={[
          { url: null, label: "Mặt trước" },
          { url: "", label: "Cận cảnh" },
        ]}
      />,
    );
    expect(
      screen.queryByRole("button", { name: "Phóng to ảnh" }),
    ).not.toBeInTheDocument();
  });

  it("is not a button when there are no photos at all (AC-8)", () => {
    render(<GalleryPage images={[]} />);
    expect(
      screen.queryByRole("button", { name: "Phóng to ảnh" }),
    ).not.toBeInTheDocument();
  });

  it("leaves out photos without an address and keeps the others in order (AC-8)", async () => {
    const user = userEvent.setup();
    const selected: number[] = [];
    render(
      <GalleryPage
        start={2}
        onSelect={(i) => selected.push(i)}
        images={[
          { url: "https://example.com/front.jpg", label: "Mặt trước" },
          { url: null, label: "Trống" },
          { url: "https://example.com/box.jpg", label: "Hộp đựng" },
          { url: "https://example.com/side.jpg", label: "Cận cảnh" },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Phóng to ảnh" }));
    const dialog = await screen.findByRole("dialog");
    // 3 of the 4 photos can be shown, and the photo on show (the 3rd of the gallery) is the 2nd of them.
    expect(within(dialog).getByText("2 / 3")).toBeInTheDocument();

    // "Next" goes to the 4th photo of the gallery: the gallery index 3, not the popup index 2.
    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    expect(selected.at(-1)).toBe(3);
    // "Previous" twice goes to the 1st photo of the gallery, jumping over the empty one.
    await user.click(within(dialog).getByRole("button", { name: "Ảnh trước" }));
    await user.click(within(dialog).getByRole("button", { name: "Ảnh trước" }));
    expect(selected.at(-1)).toBe(0);
  });
});
