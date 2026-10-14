import { useRef, useState } from "react";
import { cx } from "./cx";
import { TextField, type TextFieldProps } from "./TextField";

export type PasswordFieldProps = Omit<TextFieldProps, "type" | "adornment">;

function EyeIcon({ crossed }: { crossed: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5 fill-none stroke-current stroke-[1.75] [stroke-linecap:round] [stroke-linejoin:round]"
    >
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {crossed && <path d="M4 4l16 16" />}
    </svg>
  );
}

/** A password input with a button that shows or hides what was typed. */
export function PasswordField({
  ref,
  className,
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // The page may want the input too (React Hook Form), so keep ours and hand the same node on
  const setRefs = (node: HTMLInputElement | null) => {
    inputRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) ref.current = node;
  };

  const toggle = () => {
    setVisible((value) => !value);
    inputRef.current?.focus(); // the cursor stays in the field
  };

  return (
    <TextField
      {...props}
      ref={setRefs}
      type={visible ? "text" : "password"}
      className={cx("pr-[52px]", className)}
      adornment={
        <button
          type="button"
          onClick={toggle}
          aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          aria-pressed={visible}
          className="absolute top-px right-0.5 inline-flex size-11 cursor-pointer items-center justify-center rounded-lg bg-transparent text-muted transition-colors hover:text-ink"
        >
          <EyeIcon crossed={visible} />
        </button>
      }
    />
  );
}
