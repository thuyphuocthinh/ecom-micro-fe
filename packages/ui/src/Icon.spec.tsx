import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Icon } from "./Icon";

describe("Icon component", () => {
  it("renders Google icon correctly", () => {
    render(<Icon name="google" size={24} data-testid="google-icon" />);
    const svg = screen.getByTestId("google-icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("renders standard icons with stroke and currentColor", () => {
    render(<Icon name="cart" size={20} data-testid="cart-icon" />);
    const svg = screen.getByTestId("cart-icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("stroke", "currentColor");
  });

  it("renders plus, minus, and check icons", () => {
    render(
      <>
        <Icon name="plus" data-testid="plus-icon" />
        <Icon name="minus" data-testid="minus-icon" />
        <Icon name="check" data-testid="check-icon" />
      </>,
    );
    expect(screen.getByTestId("plus-icon")).toBeInTheDocument();
    expect(screen.getByTestId("minus-icon")).toBeInTheDocument();
    expect(screen.getByTestId("check-icon")).toBeInTheDocument();
  });

  it("returns null for non-existent icon", () => {
    // @ts-expect-error Testing invalid icon name
    const { container } = render(<Icon name="non_existent" />);
    expect(container.firstChild).toBeNull();
  });
});
