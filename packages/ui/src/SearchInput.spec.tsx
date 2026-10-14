import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SearchInput } from "./SearchInput.tsx";

describe("SearchInput component", () => {
  it("renders search input with placeholder and custom adornment", () => {
    render(
      <SearchInput
        placeholder="Tìm kiếm sản phẩm..."
        aria-label="Tìm sản phẩm"
        startAdornment={<span data-testid="search-icon">🔍</span>}
      />,
    );

    const input = screen.getByRole("searchbox", { name: "Tìm sản phẩm" });
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Tìm kiếm sản phẩm...");
    expect(screen.getByTestId("search-icon")).toBeInTheDocument();
  });

  it("handles typing and triggers onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SearchInput
        placeholder="Tìm kiếm..."
        aria-label="Tìm kiếm"
        onChange={onChange}
      />,
    );

    const input = screen.getByRole("searchbox");
    await user.type(input, "áo thun");

    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveValue("áo thun");
  });
});
