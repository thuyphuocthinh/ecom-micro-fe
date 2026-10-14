import type { ChangeEvent } from "react";
import { cx } from "./cx";
import { TextField, type TextFieldProps } from "./TextField";

const CODE_LENGTH = 6;

export type CodeInputProps = Omit<TextFieldProps, "type" | "adornment">;

/**
 * The box for the 6-digit code from an email. Keeps digits only: pasting "123 456" or "12-34-56"
 * gives "123456". (No `maxLength` on the element: the browser would cut a pasted "123 456" to
 * "123 45" before the spaces are removed.)
 */
export function CodeInput({ onChange, className, ...props }: CodeInputProps) {
  const clean = (event: ChangeEvent<HTMLInputElement>) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, CODE_LENGTH);
    if (digits !== event.target.value) event.target.value = digits;
    onChange?.(event);
  };

  return (
    <TextField
      {...props}
      type="text"
      inputMode="numeric"
      autoComplete="one-time-code"
      pattern="[0-9]*"
      onChange={clean}
      className={cx(
        "text-center text-xl font-semibold tracking-[0.5em]",
        className,
      )}
    />
  );
}
