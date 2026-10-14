import type { ComponentProps } from "react";
import { cx } from "./cx";

export type TagTone = "sale" | "ok" | "warn" | "brand" | "default";

const TONES: Record<TagTone, string> = {
  sale: "bg-sale-tint text-sale",
  ok: "bg-ok-tint text-ok",
  warn: "bg-warn-tint text-warn",
  brand: "bg-brand-tint text-brand-dark",
  default: "bg-[#f1f3f6] text-[#5b6472]",
};

/** A small pill: "Giảm 13%", "Đã giao"... */
export function Tag({
  tone = "brand",
  className,
  ...props
}: ComponentProps<"span"> & { tone?: TagTone }) {
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[12.5px] font-semibold",
        TONES[tone],
        className,
      )}
      {...props}
    />
  );
}
