import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageViewer, type ImageViewerImage } from "./ImageViewer";

const FOUR: ImageViewerImage[] = [
  { src: "/a.jpg", alt: "Mặt trước" },
  { src: "/b.jpg", alt: "Cận cảnh" },
  { src: "/c.jpg", alt: "Phụ kiện" },
  { src: "/d.jpg", alt: "Hộp đựng" },
];

/** A page that holds `open` and `index` the way a real page does. */
function Page({
  images = FOUR,
  startIndex = 0,
  startOpen = true,
  onIndexChange,
}: {
  images?: ImageViewerImage[];
  startIndex?: number;
  startOpen?: boolean;
  onIndexChange?: (index: number) => void;
}) {
  const [open, setOpen] = useState(startOpen);
  const [index, setIndex] = useState(startIndex);
  return (
    <>
      <button onClick={() => setOpen(true)}>mở</button>
      <ImageViewer
        images={images}
        open={open}
        index={index}
        onIndexChange={(next) => {
          setIndex(next);
          onIndexChange?.(next);
        }}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

async function openedDialog() {
  return screen.findByRole("dialog");
}

async function waitUntilClosed() {
  await waitFor(() =>
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
  );
}

describe("ImageViewer", () => {
  it("draws nothing while it has never been opened", () => {
    render(<Page startOpen={false} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(document.querySelector(".yarl__root")).toBeNull();
  });

  it("opens at the picture it was given, with the counter and a Vietnamese dialog (AC-1, AC-10)", async () => {
    render(<Page startIndex={1} />);
    const dialog = await openedDialog();

    expect(dialog).toHaveAttribute("aria-modal", "true");
    expect(dialog).toHaveAccessibleName("Xem ảnh");
    expect(within(dialog).getByText("2 / 4")).toBeInTheDocument();
    expect(
      within(dialog).getAllByRole("img", { name: "Cận cảnh" }).length,
    ).toBeGreaterThan(0);
  });

  it("names every control in Vietnamese (AC-10)", async () => {
    render(<Page />);
    const dialog = await openedDialog();

    for (const name of [
      "Đóng",
      "Ảnh trước",
      "Ảnh sau",
      "Phóng to",
      "Thu nhỏ",
    ]) {
      expect(within(dialog).getByRole("button", { name })).toBeInTheDocument();
    }
    // No English word of the library is left on a control.
    const names = within(dialog)
      .getAllByRole("button")
      .map((b) => b.getAttribute("aria-label") ?? "");
    expect(names.join("|")).not.toMatch(/\b(Close|Previous|Next|Zoom|of)\b/);
  });

  it("goes to the next and previous picture with the buttons (AC-3)", async () => {
    const user = userEvent.setup();
    const seen: number[] = [];
    render(<Page startIndex={1} onIndexChange={(i) => seen.push(i)} />);
    const dialog = await openedDialog();

    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    expect(within(dialog).getByText("3 / 4")).toBeInTheDocument();
    expect(seen.at(-1)).toBe(2);

    await user.click(within(dialog).getByRole("button", { name: "Ảnh trước" }));
    await user.click(within(dialog).getByRole("button", { name: "Ảnh trước" }));
    expect(within(dialog).getByText("1 / 4")).toBeInTheDocument();
    expect(seen.at(-1)).toBe(0);
  });

  it("goes to the next and previous picture with the arrow keys (AC-3)", async () => {
    const user = userEvent.setup();
    render(<Page startIndex={1} />);
    const dialog = await openedDialog();

    await user.keyboard("{ArrowRight}");
    await waitFor(() =>
      expect(within(dialog).getByText("3 / 4")).toBeInTheDocument(),
    );
    await user.keyboard("{ArrowLeft}{ArrowLeft}");
    await waitFor(() =>
      expect(within(dialog).getByText("1 / 4")).toBeInTheDocument(),
    );
  });

  it("jumps to a picture chosen in the strip of small ones (AC-4)", async () => {
    const user = userEvent.setup();
    const seen: number[] = [];
    render(<Page startIndex={0} onIndexChange={(i) => seen.push(i)} />);
    const dialog = await openedDialog();

    await user.click(
      within(dialog).getByRole("button", { name: "Ảnh 4 trên 4" }),
    );
    expect(within(dialog).getByText("4 / 4")).toBeInTheDocument();
    expect(seen.at(-1)).toBe(3);
  });

  it("closes with the button (AC-2)", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const dialog = await openedDialog();
    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitUntilClosed();
  });

  it("closes with Esc (AC-2)", async () => {
    const user = userEvent.setup();
    render(<Page />);
    await openedDialog();
    await user.keyboard("{Escape}");
    await waitUntilClosed();
  });

  it("closes with a click on the dark background, not with a click on the picture (AC-2)", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const dialog = await openedDialog();

    const picture = dialog.querySelector(".yarl__slide:not([inert]) img");
    expect(picture).not.toBeNull();
    await user.click(picture as Element);
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // The empty space around the picture is the slide itself.
    const around = dialog.querySelector(".yarl__slide:not([inert])");
    expect(around).not.toBeNull();
    await user.click(around as Element);
    await waitUntilClosed();
  });

  it("opens again at the picture the page now holds (AC-6)", async () => {
    const user = userEvent.setup();
    render(<Page startIndex={0} />);
    let dialog = await openedDialog();

    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    await user.click(within(dialog).getByRole("button", { name: "Ảnh sau" }));
    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitUntilClosed();

    await user.click(screen.getByRole("button", { name: "mở" }));
    dialog = await openedDialog();
    expect(within(dialog).getByText("3 / 4")).toBeInTheDocument();
  });

  it("has zoom buttons, the smaller one locked at the smallest level (AC-5)", async () => {
    const user = userEvent.setup();
    render(<Page />);
    const dialog = await openedDialog();
    const zoomIn = within(dialog).getByRole("button", { name: "Phóng to" });
    const zoomOut = within(dialog).getByRole("button", { name: "Thu nhỏ" });

    // At the smallest level there is nothing to zoom out to.
    expect(zoomOut).toBeDisabled();

    // jsdom has no layout, so the picture has no size and the library may keep zoom off here. What is
    // checked is that the keys do no harm and the buttons stay in place; the real zoom is for a browser.
    await user.keyboard("+");
    await user.keyboard("-");
    expect(zoomIn).toBeInTheDocument();
  });

  it("has no arrows, strip or counter with one picture, and still closes (AC-7)", async () => {
    const user = userEvent.setup();
    render(<Page images={[FOUR[0]]} />);
    const dialog = await openedDialog();

    expect(
      within(dialog).queryByRole("button", { name: "Ảnh trước" }),
    ).not.toBeInTheDocument();
    expect(
      within(dialog).queryByRole("button", { name: "Ảnh sau" }),
    ).not.toBeInTheDocument();
    expect(within(dialog).queryByText(/\d+ \/ \d+/)).not.toBeInTheDocument();
    expect(dialog.querySelector(".yarl__thumbnails")).toBeNull();
    expect(
      within(dialog).getByRole("button", { name: "Phóng to" }),
    ).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitUntilClosed();
  });

  it("draws nothing when there are no pictures, even when open (AC-11)", () => {
    render(<Page images={[]} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("locks the scroll of the page behind it while open (AC-10)", async () => {
    render(<Page />);
    await openedDialog();
    // The library puts a class on <html> or <body>; its stylesheet turns that into overflow: hidden.
    const locked = [document.documentElement, document.body].some((el) =>
      el.classList.contains("yarl__no_scroll"),
    );
    expect(locked).toBe(true);
  });

  it("carries the class that holds the project colours (AC-12)", async () => {
    render(<Page />);
    const dialog = await openedDialog();
    expect(dialog).toHaveClass("ecom-image-viewer");
  });
});
