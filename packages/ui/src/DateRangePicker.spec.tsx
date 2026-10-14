import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DateRangePicker } from "./DateRangePicker";

describe("DateRangePicker component", () => {
  it("does not render when open is false", () => {
    render(
      <DateRangePicker open={false} onClose={() => {}} onApply={() => {}} />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders popup with from and to inputs when open is true", () => {
    render(
      <DateRangePicker
        open={true}
        from="2026-10-01"
        to="2026-10-14"
        onClose={() => {}}
        onApply={() => {}}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByLabelText("Từ ngày")).toHaveValue("2026-10-01");
    expect(screen.getByLabelText("Đến ngày")).toHaveValue("2026-10-14");
  });

  it("calls onApply with updated range when clicking Áp dụng", () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();
    render(
      <DateRangePicker
        open={true}
        from="2026-10-01"
        to="2026-10-10"
        onClose={handleClose}
        onApply={handleApply}
      />,
    );

    fireEvent.change(screen.getByLabelText("Đến ngày"), {
      target: { value: "2026-10-15" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));

    expect(handleApply).toHaveBeenCalledWith({
      from: "2026-10-01",
      to: "2026-10-15",
    });
    expect(handleClose).toHaveBeenCalled();
  });

  it("shows validation error and disables Áp dụng when from > to", () => {
    const handleApply = vi.fn();
    render(
      <DateRangePicker
        open={true}
        from="2026-10-20"
        to="2026-10-10"
        onClose={() => {}}
        onApply={handleApply}
      />,
    );

    expect(
      screen.getByText("Ngày bắt đầu phải trước hoặc cùng ngày kết thúc."),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Áp dụng" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Áp dụng" }));
    expect(handleApply).not.toHaveBeenCalled();
  });

  it("updates inputs when clicking a preset button", () => {
    render(
      <DateRangePicker
        open={true}
        from=""
        to=""
        onClose={() => {}}
        onApply={() => {}}
      />,
    );

    const presetBtn = screen.getByRole("button", { name: "7 ngày qua" });
    fireEvent.click(presetBtn);

    expect(screen.getByLabelText("Từ ngày")).not.toHaveValue("");
    expect(screen.getByLabelText("Đến ngày")).not.toHaveValue("");
  });
});
