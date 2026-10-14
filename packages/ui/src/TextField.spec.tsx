import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { describe, expect, it, vi } from "vitest";
import { TextField } from "./TextField";

describe("TextField (AC-9)", () => {
  it("has a real label tied to the input", () => {
    render(<TextField label="Email" />);

    expect(screen.getByLabelText("Email")).toBeInstanceOf(HTMLInputElement);
  });

  it("is 46px tall, 10px rounded, with the border, placeholder and hover colours of the design", () => {
    render(<TextField label="Email" placeholder="ban@vi-du.com" />);

    const classes = screen.getByLabelText("Email").className;
    expect(classes).toContain("min-h-[46px]");
    expect(classes).toContain("rounded-control");
    expect(classes).toContain("border-field-border");
    expect(classes).toContain("placeholder:text-placeholder");
    expect(classes).toContain("hover:border-ink-2");
    expect(classes).toContain("focus-visible:border-brand");
    expect(classes).toContain("focus-visible:ring-brand/25");
  });

  it("shows the hint in muted small text and ties it to the input", () => {
    render(<TextField label="Mật khẩu" hint="8 đến 128 ký tự" />);

    const input = screen.getByLabelText("Mật khẩu");
    const hint = screen.getByText("8 đến 128 ký tự");
    expect(hint.className).toContain("text-muted");
    expect(hint.className).toContain("text-[13px]");
    expect(input.getAttribute("aria-describedby")).toContain(hint.id);
  });

  it("is valid when there is no error: no aria-invalid, an empty live region", () => {
    render(<TextField label="Email" />);

    const input = screen.getByLabelText("Email");
    expect(input).not.toHaveAttribute("aria-invalid");
    const errorId = input.getAttribute("aria-describedby")!.split(" ").pop()!;
    const region = document.getElementById(errorId)!;
    expect(region).toHaveAttribute("aria-live", "polite");
    expect(region).toBeEmptyDOMElement();
  });

  it("with an error: marks the input invalid, shows the text in red and ties it to the input", () => {
    render(<TextField label="Email" error="Nhập email của bạn." />);

    const input = screen.getByLabelText("Email");
    const error = screen.getByText("Nhập email của bạn.");
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.className).toContain("aria-invalid:border-err");
    expect(error.className).toContain("text-err");
    expect(error.className).toContain("font-medium");
    expect(error).toHaveAttribute("aria-live", "polite");
    expect(input.getAttribute("aria-describedby")).toContain(error.id);
  });

  it("keeps a describedby the page gives, and passes every input attribute on", () => {
    render(
      <TextField
        label="Email"
        aria-describedby="extra"
        name="email"
        autoComplete="email"
        required
      />,
    );

    const input = screen.getByLabelText("Email");
    expect(input.getAttribute("aria-describedby")).toContain("extra");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("autocomplete", "email");
    expect(input).toBeRequired();
  });

  it("gives two fields on one page different ids, and uses the id it is given", () => {
    render(
      <>
        <TextField label="Một" />
        <TextField label="Hai" />
        <TextField label="Ba" id="mine" />
      </>,
    );

    expect(screen.getByLabelText("Một").id).not.toBe(
      screen.getByLabelText("Hai").id,
    );
    expect(screen.getByLabelText("Ba").id).toBe("mine");
  });

  it("shows an adornment inside the field", () => {
    render(<TextField label="Email" adornment={<button>x</button>} />);

    expect(screen.getByRole("button", { name: "x" })).toBeInTheDocument();
  });
});

function Form({ onSubmit }: { onSubmit: (values: { email: string }) => void }) {
  const { register, handleSubmit, setFocus } = useForm<{ email: string }>({
    defaultValues: { email: "" },
  });
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField label="Email" {...register("email")} />
      <button type="button" onClick={() => setFocus("email")}>
        focus
      </button>
      <button type="submit">gửi</button>
    </form>
  );
}

describe("TextField with React Hook Form (AC-10)", () => {
  it("gives the form the typed value, and register's name, onChange and onBlur work", async () => {
    const onSubmit = vi.fn();
    render(<Form onSubmit={onSubmit} />);

    await userEvent.type(screen.getByLabelText("Email"), "a@b.vn");
    await userEvent.click(screen.getByRole("button", { name: "gửi" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0][0]).toEqual({ email: "a@b.vn" });
  });

  it("hands its ref to the <input>, so setFocus can focus it", async () => {
    render(<Form onSubmit={vi.fn()} />);

    await userEvent.click(screen.getByRole("button", { name: "focus" }));

    expect(screen.getByLabelText("Email")).toHaveFocus();
  });
});
