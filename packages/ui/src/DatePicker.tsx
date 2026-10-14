import { useId, type ComponentProps, type ReactNode } from "react";
import { cx } from "./cx";

export interface DatePickerProps extends Omit<
  ComponentProps<"input">,
  "type" | "onChange"
> {
  label?: ReactNode;
  value?: string;
  onChange?: (date: string) => void;
  hint?: ReactNode;
  error?: string;
}

/**
 * DatePicker component cho phép chọn 1 ngày theo chuẩn thiết kế @ecom/ui
 */
export function DatePicker({
  label,
  value = "",
  onChange,
  hint,
  error,
  id,
  className,
  disabled,
  ...props
}: DatePickerProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-sm font-semibold text-ink">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type="date"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          [hint ? hintId : null, error ? errorId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={cx(
          "w-full min-h-[46px] px-3.5 rounded-control border border-field-border bg-white text-[15px] leading-tight text-ink transition-colors hover:border-ink-2 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25 disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed aria-invalid:border-err",
          className,
        )}
        {...props}
      />
      {hint && (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          aria-live="polite"
          className="text-[13px] font-medium text-err"
        >
          {error}
        </p>
      )}
    </div>
  );
}
