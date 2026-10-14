import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProductQuantityStepper } from "./ProductQuantityStepper.tsx";

describe("ProductQuantityStepper (AC-5)", () => {
  it("renders current quantity with accessible group label", () => {
    render(<ProductQuantityStepper quantity={3} max={10} onChange={vi.fn()} />);

    expect(screen.getByText("Số lượng")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("disables decrease button when at minimum (1)", () => {
    render(<ProductQuantityStepper quantity={1} max={10} onChange={vi.fn()} />);

    const decBtn = screen.getByRole("button", { name: "Giảm số lượng" });
    const incBtn = screen.getByRole("button", { name: "Tăng số lượng" });

    expect(decBtn).toBeDisabled();
    expect(incBtn).not.toBeDisabled();
  });

  it("disables increase button and shows notice when at maximum", () => {
    render(<ProductQuantityStepper quantity={5} max={5} onChange={vi.fn()} />);

    const decBtn = screen.getByRole("button", { name: "Giảm số lượng" });
    const incBtn = screen.getByRole("button", { name: "Tăng số lượng" });

    expect(decBtn).not.toBeDisabled();
    expect(incBtn).toBeDisabled();
    expect(screen.getByText("Đã đạt số lượng còn lại")).toBeInTheDocument();
  });

  it("calls onChange with updated quantity when clicking + and -", async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ProductQuantityStepper quantity={2} max={10} onChange={handleChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Tăng số lượng" }));
    expect(handleChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Giảm số lượng" }));
    expect(handleChange).toHaveBeenCalledWith(1);
  });
});
