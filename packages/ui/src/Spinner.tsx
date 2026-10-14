import type { ComponentProps } from "react";
import { cx } from "./cx";

/** A turning ring in the text colour. It says nothing to a screen reader: the words next to it do. */
export function Spinner({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cx(
        "inline-block size-[18px] shrink-0 rounded-full border-2 border-current/40 border-t-current motion-safe:animate-spin",
        className,
      )}
      {...props}
    />
  );
}
