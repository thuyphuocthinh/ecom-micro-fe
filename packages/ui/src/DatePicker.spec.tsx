import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DatePicker } from "./DatePicker";

describe("DatePicker component", () => {
  it("renders with label and displays initial date", () => {
    render(
      <DatePicker
        label="Ngày bắt đầu"
        value="2026-10-14"
        onChange={() => {}}
      />,
    );
    expect(screen.getByLabelText("Ngày bắt đầu")).toHaveValue("2026-10-14");
  });

  it("calls onChange when a new date is picked", () => {
    const handleChange = vi.fn();
    render(<DatePicker label="Chọn ngày" value="" onChange={handleChange} />);
    const input = screen.getByLabelText("Chọn ngày");
    fireEvent.change(input, { target: { value: "2026-10-20" } });
    expect(handleChange).toHaveBeenCalledWith("2026-10-20");
  });

  it("renders error message when error prop is provided", () => {
    render(
      <DatePicker
        label="Ngày"
        value=""
        error="Ngày không hợp lệ"
        onChange={() => {}}
      />,
    );
    expect(screen.getByText("Ngày không hợp lệ")).toBeInTheDocument();
    expect(screen.getByLabelText("Ngày")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
