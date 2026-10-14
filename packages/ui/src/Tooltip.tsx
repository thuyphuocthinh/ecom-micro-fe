import {
  useState,
  useRef,
  useId,
  cloneElement,
  isValidElement,
  type ReactNode,
  type ReactElement,
  type HTMLAttributes,
} from "react";
import { cx } from "./cx";

export interface TooltipProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  "content"
> {
  content: ReactNode;
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  delayMs?: number;
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  side = "top",
  delayMs = 150,
  disabled = false,
  className = "",
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = useId();

  if (!content || disabled) {
    return children;
  }

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const handleFocus = () => {
    setIsVisible(true);
  };

  const handleBlur = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[side];

  const arrowClasses = {
    top: "top-full left-1/2 -translate-x-1/2 border-t-[#101828] border-x-transparent border-b-transparent border-4",
    bottom:
      "bottom-full left-1/2 -translate-x-1/2 border-b-[#101828] border-x-transparent border-t-transparent border-4",
    left: "left-full top-1/2 -translate-y-1/2 border-l-[#101828] border-y-transparent border-r-transparent border-4",
    right:
      "right-full top-1/2 -translate-y-1/2 border-r-[#101828] border-y-transparent border-l-transparent border-4",
  }[side];

  const trigger = isValidElement(children) ? (
    cloneElement(children as ReactElement<Record<string, unknown>>, {
      onMouseEnter: (e: React.MouseEvent) => {
        (
          children.props as { onMouseEnter?: (e: React.MouseEvent) => void }
        )?.onMouseEnter?.(e);
        handleMouseEnter();
      },
      onMouseLeave: (e: React.MouseEvent) => {
        (
          children.props as { onMouseLeave?: (e: React.MouseEvent) => void }
        )?.onMouseLeave?.(e);
        handleMouseLeave();
      },
      onFocus: (e: React.FocusEvent) => {
        (
          children.props as { onFocus?: (e: React.FocusEvent) => void }
        )?.onFocus?.(e);
        handleFocus();
      },
      onBlur: (e: React.FocusEvent) => {
        (
          children.props as { onBlur?: (e: React.FocusEvent) => void }
        )?.onBlur?.(e);
        handleBlur();
      },
      "aria-describedby": isVisible ? tooltipId : undefined,
    })
  ) : (
    <span>{children}</span>
  );

  return (
    <div
      className={cx("relative inline-flex items-center", className)}
      {...props}
    >
      {trigger}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          aria-hidden={!isVisible}
          className={cx(
            "absolute z-50 pointer-events-none px-2.5 py-1.5 rounded-[6px] bg-[#101828] text-white text-xs font-medium leading-tight shadow-lg max-w-xs w-max whitespace-normal text-center animate-in fade-in zoom-in-95 duration-150",
            positionClasses,
          )}
        >
          {content}
          <span
            className={cx("absolute size-0 border-solid", arrowClasses)}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
