import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createRef, type FormEvent } from "react";
import { describe, expect, it, vi } from "vitest";
import { PasswordField } from "./PasswordField";

describe("PasswordField (AC-11)", () => {
  it("starts as dots, with a button named 'Hiện mật khẩu' that is not pressed", () => {
    render(<PasswordField label="Mật khẩu" autoComplete="current-password" />);

    const input = screen.getByLabelText("Mật khẩu");
    expect(input).toHaveAttribute("type", "password");
    expect(input).toHaveAttribute("autocomplete", "current-password");
    expect(
      screen.getByRole("button", { name: "Hiện mật khẩu" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("shows the text when the eye is pressed and hides it again on the next press", async () => {
    render(<PasswordField label="Mật khẩu" />);
    const input = screen.getByLabelText("Mật khẩu");

    await userEvent.click(
      screen.getByRole("button", { name: "Hiện mật khẩu" }),
    );
    expect(input).toHaveAttribute("type", "text");
    const hide = screen.getByRole("button", { name: "Ẩn mật khẩu" });
    expect(hide).toHaveAttribute("aria-pressed", "true");

    await userEvent.click(hide);
    expect(input).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("button", { name: "Hiện mật khẩu" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  it("keeps the cursor in the password field after the press", async () => {
    render(<PasswordField label="Mật khẩu" />);

    await userEvent.click(
      screen.getByRole("button", { name: "Hiện mật khẩu" }),
    );

    expect(screen.getByLabelText("Mật khẩu")).toHaveFocus();
  });

  it("does not submit the form when the eye is pressed", async () => {
    const onSubmit = vi.fn((event: FormEvent) => event.preventDefault());
    render(
      <form onSubmit={onSubmit}>
        <PasswordField label="Mật khẩu" />
      </form>,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Hiện mật khẩu" }),
    );

    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("has a 44px button on the right and leaves room so the text does not run under it", () => {
    render(<PasswordField label="Mật khẩu" />);

    expect(screen.getByLabelText("Mật khẩu").className).toContain("pr-[52px]");
    const button = screen.getByRole("button", { name: "Hiện mật khẩu" });
    expect(button.className).toContain("size-11");
    expect(button.className).toContain("absolute");
    expect(button.className).toContain("right-0.5");
  });

  it("the eye drawing is hidden from screen readers and changes when the text is shown", async () => {
    render(<PasswordField label="Mật khẩu" />);
    const button = screen.getByRole("button", { name: "Hiện mật khẩu" });
    const paths = () => button.querySelectorAll("path").length;

    expect(button.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const whenHidden = paths();
    await userEvent.click(button);

    expect(paths()).toBe(whenHidden + 1);
  });

  it("hands the <input> to the page's ref (for React Hook Form), object or function", () => {
    const objectRef = createRef<HTMLInputElement>();
    const { unmount } = render(
      <PasswordField label="Mật khẩu" ref={objectRef} />,
    );
    expect(objectRef.current).toBe(screen.getByLabelText("Mật khẩu"));
    unmount();

    const functionRef = vi.fn();
    render(<PasswordField label="Mật khẩu" ref={functionRef} />);
    expect(functionRef).toHaveBeenCalledWith(screen.getByLabelText("Mật khẩu"));
  });

  it("shows a label, a hint and an error like TextField does", () => {
    render(
      <PasswordField
        label="Mật khẩu"
        hint="8 đến 128 ký tự"
        error="Quá ngắn"
      />,
    );

    expect(screen.getByLabelText("Mật khẩu")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("8 đến 128 ký tự")).toBeInTheDocument();
    expect(screen.getByText("Quá ngắn")).toBeInTheDocument();
  });
});
