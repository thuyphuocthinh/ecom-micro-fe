import type { ComponentProps } from "react";
import { cx } from "./cx";

/** First thing a keyboard user reaches: jumps over the header to the page content. Hidden until it has focus. */
export function SkipLink({
  href = "#main",
  className,
  children = "Bỏ qua, tới nội dung chính",
  ...props
}: ComponentProps<"a">) {
  return (
    <a
      href={href}
      className={cx(
        "absolute left-4 -top-16 z-50 rounded-lg bg-ink px-4 py-3 text-white no-underline focus-visible:top-3",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
