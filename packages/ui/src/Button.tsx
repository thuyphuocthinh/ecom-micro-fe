import type { ComponentProps } from "react";
import { cx } from "./cx";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "secondary" | "ghost";
export type ButtonSize = "md" | "lg";

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-control border border-transparent font-semibold leading-none whitespace-nowrap no-underline cursor-pointer touch-manipulation transition-colors disabled:opacity-55 disabled:cursor-not-allowed aria-disabled:opacity-55 aria-disabled:cursor-not-allowed";

const VARIANTS: Record<ButtonVariant, string> = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  secondary:
    "bg-white text-ink border-field-border hover:bg-canvas hover:border-ink-2",
  ghost: "bg-transparent text-ink-2 hover:bg-ink/6",
};

const SIZES: Record<ButtonSize, string> = {
  md: "min-h-11 px-5 text-[15px]",
  lg: "min-h-13 px-7 text-base",
};

/** The look of a button, for a link that must look like one: <Link className={buttonClasses({ variant: "primary" })}>. */
export function buttonClasses({
  variant = "primary",
  size = "md",
}: { variant?: ButtonVariant; size?: ButtonSize } = {}): string {
  return cx(BASE, VARIANTS[variant], SIZES[size]);
}

/** The look of a link inside a sentence. */
export function linkClasses(): string {
  return "font-semibold text-brand underline underline-offset-[3px] cursor-pointer hover:text-brand-dark";
}

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** The action is under way: shows a spinner and cannot be pressed again (no double send). */
  loading?: boolean;
}

export function Button({
  variant,
  size,
  loading = false,
  type = "button",
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cx(buttonClasses({ variant, size }), className)}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
}
