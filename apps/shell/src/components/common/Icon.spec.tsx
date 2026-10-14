import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Icon } from "./Icon.tsx";

describe("Icon component", () => {
  it("renders Google icon", () => {
    render(<Icon name="google" size={24} data-testid="google-icon" />);
    const svg = screen.getByTestId("google-icon");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveStyle({ width: "24px", height: "24px" });
  });

  it("renders Search icon", () => {
    render(<Icon name="search" data-testid="search-icon" />);
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("renders Cart icon", () => {
    render(<Icon name="cart" data-testid="cart-icon" />);
    expect(screen.getByTestId("cart-icon")).toBeInTheDocument();
  });

  it("returns null for non-existent icon", () => {
    // @ts-expect-error Testing invalid icon name
    const { container } = render(<Icon name="non_existent" />);
    expect(container.firstChild).toBeNull();
  });
});
