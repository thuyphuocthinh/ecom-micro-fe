import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { CartEmptyState } from "./CartEmptyState.tsx";

describe("CartEmptyState", () => {
  it("renders empty state heading, message, and continue shopping link", () => {
    render(
      <MemoryRouter>
        <CartEmptyState />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Giỏ hàng đang trống", level: 2 }),
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        "Chọn vài món bạn thích, hàng sẽ nằm ở đây cho tới khi bạn đặt hàng.",
      ),
    ).toBeInTheDocument();

    const link = screen.getByRole("link", { name: "Tiếp tục mua sắm" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/search");
  });
});
