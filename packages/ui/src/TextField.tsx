import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

export interface TextFieldProps extends ComponentProps<"input"> {
  label: ReactNode;
  /** A line of help under the field. */
  hint?: ReactNode;
  /** What is wrong with the value (from the form's Zod schema). Empty or missing: the field is fine. */
  error?: string;
  /** Something that sits inside the field on the right, such as the show-password button. */
  adornment?: ReactNode;
}

export const INPUT_CLASSES =
  "w-full min-h-[46px] px-3.5 rounded-control border border-field-border bg-white text-[15px] leading-tight font-normal text-ink transition-colors placeholder:text-placeholder hover:border-ink-2 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25 aria-invalid:border-err";

/**
 * A labelled input. Works with React Hook Form: `<TextField label="Email" {...register("email")} />`
 * (the ref goes to the <input>, so `setFocus` and "focus the first wrong field" work).
 */
export function TextField({
  label,
  hint,
  error,
  adornment,
  id,
  className,
  "aria-describedby": describedBy,
  ...props
}: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedByIds = [hint ? hintId : null, errorId, describedBy]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds}
          className={cx(INPUT_CLASSES, className)}
          {...props}
        />
        {adornment}
      </div>
      {hint && (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {/* Always on the page, so a screen reader announces the text when it appears */}
      <p
        id={errorId}
        aria-live="polite"
        className="text-[13px] font-medium text-err"
      >
        {error}
      </p>
    </div>
  );
}
