import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Image } from "./Image";

export type AvatarSize = "sm" | "md" | "lg";

const SIZES: Record<AvatarSize, { container: string; text: string }> = {
  sm: { container: "size-[30px]", text: "text-xs" },
  md: { container: "size-12", text: "text-xl" },
  lg: { container: "size-20", text: "text-2xl" },
};

export interface AvatarProps extends ComponentProps<"div"> {
  src?: string | null;
  alt?: string;
  fallback: string;
  size?: AvatarSize;
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
  ...props
}: AvatarProps) {
  const { container, text } = SIZES[size];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        className={cx(
          container,
          "rounded-full object-cover shrink-0 border border-line",
          className,
        )}
        fallback={
          <div
            aria-hidden="true"
            className={cx(
              container,
              text,
              "rounded-full bg-brand text-white inline-flex items-center justify-center font-head font-bold shrink-0 select-none",
              className,
            )}
            {...props}
          >
            {fallback}
          </div>
        }
      />
    );
  }

  return (
    <div
      aria-hidden="true"
      className={cx(
        container,
        text,
        "rounded-full bg-brand text-white inline-flex items-center justify-center font-head font-bold shrink-0 select-none",
        className,
      )}
      {...props}
    >
      {fallback}
    </div>
  );
}
