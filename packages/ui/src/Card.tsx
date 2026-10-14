import type { ComponentProps } from "react";
import { cx } from "./cx";

/** A white box with a thin border. */
export function Card({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cx("rounded-card border border-line bg-card", className)}
      {...props}
    />
  );
}
