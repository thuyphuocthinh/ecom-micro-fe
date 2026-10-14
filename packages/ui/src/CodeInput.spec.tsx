import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { CodeInput } from "./CodeInput";

describe("CodeInput (AC-12)", () => {
  it("is built for a one-time code: numeric keypad, autofill from the email or SMS", () => {
    render(<CodeInput label="Mã xác minh" />);

    const input = screen.getByLabelText("Mã xác minh");
    expect(input).toHaveAttribute("inputmode", "numeric");
    expect(input).toHaveAttribute("autocomplete", "one-time-code");
    expect(input).toHaveAttribute("pattern", "[0-9]*");
    expect(input.className).toContain("text-center");
    expect(input.className).toContain("tracking-[0.5em]");
  });

  it.each([
    ["123 456", "123456"],
    ["12-34-56", "123456"],
    [" 654321 ", "654321"],
    ["12ab34", "1234"],
    ["1234567890", "123456"],
    ["abc", ""],
  ])("turns %j into %j", (typed, expected) => {
    const onChange = vi.fn();
    render(<CodeInput label="Mã xác minh" onChange={onChange} />);

    const input = screen.getByLabelText("Mã xác minh") as HTMLInputElement;
    fireEvent.change(input, { target: { value: typed } });

    expect(input.value).toBe(expected);
    expect(onChange.mock.calls.at(-1)![0].target.value).toBe(expected);
  });

  it("does not cut a pasted code before the spaces are gone (no maxlength on the element)", () => {
    render(<CodeInput label="Mã xác minh" />);

    expect(screen.getByLabelText("Mã xác minh")).not.toHaveAttribute(
      "maxlength",
    );
  });

  it("keeps only digits when a person types and pastes", async () => {
    function Page() {
      const [value, setValue] = useState("");
      return (
        <CodeInput
          label="Mã xác minh"
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
      );
    }
    render(<Page />);
    const input = screen.getByLabelText("Mã xác minh") as HTMLInputElement;

    await userEvent.type(input, "1a2b3");
    expect(input.value).toBe("123");

    await userEvent.clear(input);
    await userEvent.click(input);
    await userEvent.paste("987 654 321");
    expect(input.value).toBe("987654");
  });

  it("shows its error like TextField does", () => {
    render(<CodeInput label="Mã xác minh" error="Nhập đủ 6 chữ số." />);

    expect(screen.getByLabelText("Mã xác minh")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(screen.getByText("Nhập đủ 6 chữ số.")).toBeInTheDocument();
  });
});
