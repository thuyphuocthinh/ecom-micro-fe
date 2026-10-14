import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip } from "./Tooltip.tsx";

describe("Tooltip Component", () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders trigger and shows tooltip on hover after delay", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <Tooltip content="Chi tiết sản phẩm">
        <button type="button">Di chuột vào tôi</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button", { name: "Di chuột vào tôi" });
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

    await user.hover(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toBeInTheDocument();
    expect(tooltip).toHaveTextContent("Chi tiết sản phẩm");

    await user.unhover(button);
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("shows tooltip on focus and hides on blur", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <Tooltip content="Gợi ý tiêu đề">
        <a href="#test">Tiêu đề sản phẩm</a>
      </Tooltip>,
    );

    const link = screen.getByRole("link", { name: "Tiêu đề sản phẩm" });
    await user.tab();
    expect(link).toHaveFocus();

    expect(screen.getByRole("tooltip")).toHaveTextContent("Gợi ý tiêu đề");

    await user.tab();
    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });

  it("does not render tooltip when disabled", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

    render(
      <Tooltip content="Không hiển thị" disabled>
        <button type="button">Nút tắt tooltip</button>
      </Tooltip>,
    );

    const button = screen.getByRole("button", { name: "Nút tắt tooltip" });
    await user.hover(button);
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
