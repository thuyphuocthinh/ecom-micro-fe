import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ErrorBoundary, ErrorFallback } from "./ErrorBoundary";

function ProblemChild({ shouldThrow = false }: { shouldThrow?: boolean }) {
  if (shouldThrow) {
    throw new Error("Crashing deliberately for test");
  }
  return <div>Everything is fine</div>;
}

describe("ErrorBoundary", () => {
  it("renders children when there is no error", () => {
    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={false} />
      </ErrorBoundary>,
    );
    expect(screen.getByText("Everything is fine")).toBeInTheDocument();
  });

  it("catches errors and renders fallback UI", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByRole("heading", { name: "Đã xảy ra lỗi không mong muốn" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Crashing deliberately for test/),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it("supports custom fallback render prop", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary
        fallback={(error) => <div>Custom error: {error.message}</div>}
      >
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(
      screen.getByText("Custom error: Crashing deliberately for test"),
    ).toBeInTheDocument();

    spy.mockRestore();
  });

  it("triggers onCatch callback when an error is caught", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const onCatch = vi.fn();

    render(
      <ErrorBoundary onCatch={onCatch}>
        <ProblemChild shouldThrow={true} />
      </ErrorBoundary>,
    );

    expect(onCatch).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({ componentStack: expect.any(String) }),
    );

    spy.mockRestore();
  });
});

describe("ErrorFallback", () => {
  it("renders error message and action buttons", async () => {
    const reset = vi.fn();
    const user = userEvent.setup();

    render(
      <ErrorFallback
        error={new Error("Something failed")}
        resetErrorBoundary={reset}
        title="Tiêu đề lỗi"
        description="Mô tả lỗi"
      />,
    );

    expect(screen.getByText("Tiêu đề lỗi")).toBeInTheDocument();
    expect(screen.getByText("Mô tả lỗi")).toBeInTheDocument();

    const reloadBtn = screen.getByRole("button", { name: "Tải lại trang" });
    await user.click(reloadBtn);
    expect(reset).toHaveBeenCalled();
  });
});
