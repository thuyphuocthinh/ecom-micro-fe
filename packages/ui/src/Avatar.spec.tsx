import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Avatar } from "./Avatar.tsx";

describe("Avatar component", () => {
  it("renders image when src is provided", () => {
    render(
      <Avatar src="https://example.com/pic.jpg" alt="Thinh" fallback="T" />,
    );

    const img = screen.getByRole("img", { name: "Thinh" });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "https://example.com/pic.jpg");
    expect(screen.queryByText("T")).not.toBeInTheDocument();
  });

  it("renders fallback text initial when src is null or missing", () => {
    render(<Avatar src={null} fallback="T" />);

    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
