import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImageViewer } from "./ImageViewer";

// How many times the code of the library is really loaded. The factory runs once, the first time anything
// imports the library, so the count is the number of loads. Kept in its own file: a module loaded by
// another test file would already be in the cache and spoil the count.
const libraryLoads = vi.hoisted(() => ({ count: 0 }));

vi.mock("yet-another-react-lightbox", async (importOriginal) => {
  libraryLoads.count += 1;
  return importOriginal();
});

const IMAGES = [
  { src: "/a.jpg", alt: "A" },
  { src: "/b.jpg", alt: "B" },
];

function Page() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}>mở</button>
      <ImageViewer
        images={IMAGES}
        open={open}
        index={0}
        onIndexChange={() => {}}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

describe("ImageViewer loading (AC-9)", () => {
  it("does not load the library before the first click, and loads it once", async () => {
    const user = userEvent.setup();
    render(<Page />);

    // The page is on screen and nobody has clicked a picture: the library is not loaded. Wait until every
    // import that was started has finished, so a load that only begins a moment later is not missed.
    await vi.dynamicImportSettled();
    expect(libraryLoads.count).toBe(0);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "mở" }));
    const dialog = await screen.findByRole("dialog");
    expect(libraryLoads.count).toBe(1);

    await user.click(within(dialog).getByRole("button", { name: "Đóng" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(),
    );

    // Opened a second time: the library is already there and is not loaded again.
    await user.click(screen.getByRole("button", { name: "mở" }));
    await screen.findByRole("dialog");
    await vi.dynamicImportSettled();
    expect(libraryLoads.count).toBe(1);
  });
});
