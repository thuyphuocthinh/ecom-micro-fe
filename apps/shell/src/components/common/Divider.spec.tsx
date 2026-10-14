import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Divider } from "./Divider.tsx";

describe("Divider component", () => {
  it("renders text between two separating line segments (---- text ----)", () => {
    const { container } = render(<Divider>Hoặc</Divider>);
    expect(screen.getByText("Hoặc")).toBeInTheDocument();

    // Check that there are two line elements flanking the text
    const lines = container.querySelectorAll(".h-px.flex-1.bg-line");
    expect(lines.length).toBe(2);
  });

  it("renders a standard hr line when no children are provided", () => {
    const { container } = render(<Divider />);
    expect(container.querySelector("hr")).toBeInTheDocument();
  });
});
