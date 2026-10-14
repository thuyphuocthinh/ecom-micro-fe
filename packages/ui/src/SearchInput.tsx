import type { ComponentProps, ReactNode } from "react";
import { cx } from "./cx";

export interface SearchInputProps extends ComponentProps<"input"> {
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
}

export function SearchInput({
  className,
  startAdornment,
  endAdornment,
  type = "search",
  ...props
}: SearchInputProps) {
  return (
    <div className="relative flex-1 flex items-center">
      {startAdornment && (
        <span className="absolute left-3.5 flex items-center pointer-events-none text-muted">
          {startAdornment}
        </span>
      )}
      <input
        type={type}
        className={cx(
          "w-full min-h-[44px] border border-line rounded-control bg-white text-ink placeholder:text-muted transition-colors hover:border-ink-2 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25",
          startAdornment ? "pl-11" : "pl-3.5",
          endAdornment ? "pr-11" : "pr-3.5",
          className,
        )}
        {...props}
      />
      {endAdornment && (
        <span className="absolute right-3.5 flex items-center">
          {endAdornment}
        </span>
      )}
    </div>
  );
}
