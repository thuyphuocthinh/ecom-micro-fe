import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuHeader,
  DropdownMenuDivider,
} from "./DropdownMenu.tsx";

describe("DropdownMenu component", () => {
  it("opens menu when trigger is clicked and closes on outside click or Escape", async () => {
    const user = userEvent.setup();

    render(
      <DropdownMenu
        trigger={({ isOpen }) => (
          <button type="button">
            Menu Trigger {isOpen ? "Open" : "Closed"}
          </button>
        )}
      >
        <DropdownMenuHeader>Header Info</DropdownMenuHeader>
        <DropdownMenuItem onClick={vi.fn()}>Item 1</DropdownMenuItem>
        <DropdownMenuDivider />
        <DropdownMenuItem danger onClick={vi.fn()}>
          Delete
        </DropdownMenuItem>
      </DropdownMenu>,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByText("Menu Trigger Closed")).toBeInTheDocument();

    // Click trigger to open
    await user.click(screen.getByRole("button", { name: /menu trigger/i }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.getByText("Header Info")).toBeInTheDocument();
    expect(screen.getByText("Item 1")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    // Press Escape to close
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("calls item onClick and closes menu when item is clicked", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();

    render(
      <DropdownMenu trigger={<button type="button">Trigger</button>}>
        <DropdownMenuItem onClick={onClick}>Click Me</DropdownMenuItem>
      </DropdownMenu>,
    );

    await user.click(screen.getByRole("button", { name: "Trigger" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();

    await user.click(screen.getByRole("menuitem", { name: "Click Me" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });
});
