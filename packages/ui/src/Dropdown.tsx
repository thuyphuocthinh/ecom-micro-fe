import {
  useState,
  useRef,
  useEffect,
  useId,
  type ReactNode,
  useMemo,
} from "react";
import { cx } from "./cx";

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  label: ReactNode;
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: ReactNode;
  id?: string;
  className?: string;
  "aria-describedby"?: string;
}

export function Dropdown({
  label,
  options,
  value = "",
  onChange,
  placeholder = "Chọn…",
  searchable = false,
  searchPlaceholder = "Tìm kiếm...",
  disabled = false,
  error,
  hint,
  id,
  className,
  "aria-describedby": describedBy,
}: DropdownProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const describedByIds = [hint ? hintId : null, errorId, describedBy]
    .filter(Boolean)
    .join(" ");

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) {
      return options;
    }
    const term = searchTerm.trim().toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(term));
  }, [options, searchable, searchTerm]);

  // Click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input on open
  useEffect(() => {
    if (isOpen && searchable) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, searchable]);

  const handleSelect = (val: string) => {
    onChange?.(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col gap-1.5" ref={containerRef}>
      <label htmlFor={inputId} className="text-sm font-semibold text-ink">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          id={inputId}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedByIds || undefined}
          onClick={() => {
            if (!disabled) {
              setIsOpen((prev) => !prev);
              if (isOpen) setSearchTerm("");
            }
          }}
          className={cx(
            "w-full min-h-[46px] px-3.5 rounded-control border border-field-border bg-white text-[15px] leading-tight font-normal text-ink text-left transition-colors flex items-center justify-between gap-2 hover:border-ink-2 focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25 disabled:bg-canvas disabled:text-muted disabled:cursor-not-allowed aria-invalid:border-err",
            !selectedOption && "text-placeholder",
            className,
          )}
        >
          <span className="truncate">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <svg
            className={cx(
              "size-4 shrink-0 text-muted transition-transform duration-200",
              isOpen && "rotate-180",
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-field-border rounded-control shadow-lg z-50 max-h-60 overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100"
          >
            {searchable && (
              <div className="p-2 border-b border-line bg-canvas/40 sticky top-0 z-10">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-9 px-3 text-[14px] rounded-control border border-field-border bg-white text-ink placeholder:text-placeholder focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            <div className="overflow-y-auto max-h-52 p-1">
              {filteredOptions.length === 0 ? (
                <div className="py-3 px-3.5 text-center text-sm text-muted">
                  Không tìm thấy kết quả
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      disabled={opt.disabled}
                      onClick={() => handleSelect(opt.value)}
                      className={cx(
                        "w-full px-3 py-2 text-left text-[14.5px] rounded-[6px] transition-colors flex items-center justify-between gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed",
                        isSelected
                          ? "bg-brand/10 text-brand font-semibold"
                          : "text-ink hover:bg-canvas",
                      )}
                    >
                      <span className="truncate">{opt.label}</span>
                      {isSelected && (
                        <svg
                          className="size-4 shrink-0 text-brand"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {hint && (
        <p id={hintId} className="text-[13px] text-muted">
          {hint}
        </p>
      )}
      <p
        id={errorId}
        aria-live="polite"
        className="text-[13px] font-medium text-err"
      >
        {error}
      </p>
    </div>
  );
}
