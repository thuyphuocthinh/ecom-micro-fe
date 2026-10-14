import type { ReactNode } from "react";

export interface DividerProps {
  children?: ReactNode;
  className?: string;
}

export function Divider({ children, className = "my-2" }: DividerProps) {
  if (!children) {
    return <hr className={`border-t border-line ${className}`} />;
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="h-px flex-1 bg-line" />
      <span className="text-xs uppercase tracking-wider text-ink-3 font-medium select-none">
        {children}
      </span>
      <div className="h-px flex-1 bg-line" />
    </div>
  );
}
