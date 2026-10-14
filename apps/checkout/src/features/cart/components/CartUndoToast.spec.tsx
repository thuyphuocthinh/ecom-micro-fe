import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartUndoToast } from "./CartUndoToast.tsx";

describe("CartUndoToast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders nothing when productName is null", () => {
    const { container } = render(
      <CartUndoToast productName={null} onUndo={vi.fn()} onDismiss={vi.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders toast with product name and triggers onUndo when clicked", async () => {
    // For user interaction with fake timers, advance timers carefully or use real timers
    vi.useRealTimers();
    const user = userEvent.setup();
    const handleUndo = vi.fn();
    const handleDismiss = vi.fn();

    render(
      <CartUndoToast
        productName="Áo thun cotton"
        onUndo={handleUndo}
        onDismiss={handleDismiss}
        durationMs={5000}
      />,
    );

    expect(screen.getByText("Đã xoá Áo thun cotton")).toBeInTheDocument();

    const undoBtn = screen.getByRole("button", { name: "Hoàn tác" });
    await user.click(undoBtn);

    expect(handleUndo).toHaveBeenCalledTimes(1);
  });

  it("auto-dismisses after durationMs", () => {
    const handleDismiss = vi.fn();

    render(
      <CartUndoToast
        productName="Sạc nhanh GaN"
        onUndo={vi.fn()}
        onDismiss={handleDismiss}
        durationMs={3000}
      />,
    );

    expect(screen.getByText("Đã xoá Sạc nhanh GaN")).toBeInTheDocument();
    expect(handleDismiss).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(handleDismiss).toHaveBeenCalledTimes(1);
  });
});
