import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type ComponentProps,
} from "react";
import { cx } from "./cx";

interface DropdownMenuContextValue {
  isOpen: boolean;
  close: () => void;
}

const DropdownMenuContext = createContext<DropdownMenuContextValue | null>(
  null,
);

export function useDropdownMenu() {
  const context = useContext(DropdownMenuContext);
  if (!context) {
    throw new Error(
      "DropdownMenu compound components must be used within DropdownMenu",
    );
  }
  return context;
}

export interface DropdownMenuProps {
  trigger: ReactNode | ((props: { isOpen: boolean }) => ReactNode);
  children: ReactNode;
  align?: "left" | "right";
  className?: string;
  menuClassName?: string;
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
  menuClassName,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = () => setIsOpen(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <DropdownMenuContext.Provider value={{ isOpen, close }}>
      <div
        className={cx("relative inline-block text-left", className)}
        ref={containerRef}
      >
        <div
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex cursor-pointer"
        >
          {typeof trigger === "function" ? trigger({ isOpen }) : trigger}
        </div>

        {isOpen && (
          <div
            role="menu"
            className={cx(
              "absolute top-full mt-2 w-56 rounded-xl border border-line bg-white shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-150",
              align === "right" ? "right-0" : "left-0",
              menuClassName,
            )}
          >
            {children}
          </div>
        )}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuHeader({
  className,
  children,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cx("px-4 py-2 border-b border-line mb-1 text-ink", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuDivider({
  className,
  ...props
}: ComponentProps<"div">) {
  return (
    <div
      className={cx("my-1 border-t border-line", className)}
      role="separator"
      {...props}
    />
  );
}

export interface DropdownMenuItemProps extends ComponentProps<"button"> {
  danger?: boolean;
}

export function DropdownMenuItem({
  className,
  danger = false,
  onClick,
  children,
  ...props
}: DropdownMenuItemProps) {
  const { close } = useDropdownMenu();

  return (
    <button
      type="button"
      role="menuitem"
      onClick={(e) => {
        close();
        onClick?.(e);
      }}
      className={cx(
        "w-full flex items-center gap-2.5 px-4 py-2 text-[14.5px] font-medium transition-colors cursor-pointer text-left",
        danger
          ? "text-err hover:bg-err/10 hover:text-err"
          : "text-ink hover:bg-canvas hover:text-brand",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
