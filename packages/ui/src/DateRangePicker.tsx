import { useState, useEffect, useRef } from "react";
import { Button } from "./Button";
import { DatePicker } from "./DatePicker";

export interface DateRange {
  from: string;
  to: string;
}

export interface DateRangePreset {
  label: string;
  getRange: () => DateRange;
}

function formatDateToIso(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

const DEFAULT_PRESETS: DateRangePreset[] = [
  {
    label: "7 ngày qua",
    getRange: () => {
      const now = new Date();
      const past = new Date();
      past.setDate(past.getDate() - 7);
      return { from: formatDateToIso(past), to: formatDateToIso(now) };
    },
  },
  {
    label: "30 ngày qua",
    getRange: () => {
      const now = new Date();
      const past = new Date();
      past.setDate(past.getDate() - 30);
      return { from: formatDateToIso(past), to: formatDateToIso(now) };
    },
  },
  {
    label: "Tháng này",
    getRange: () => {
      const now = new Date();
      const past = new Date(now.getFullYear(), now.getMonth(), 1);
      return { from: formatDateToIso(past), to: formatDateToIso(now) };
    },
  },
  {
    label: "Năm nay",
    getRange: () => {
      const now = new Date();
      const past = new Date(now.getFullYear(), 0, 1);
      return { from: formatDateToIso(past), to: formatDateToIso(now) };
    },
  },
];

export interface DateRangePickerProps {
  /** Kiểm soát trạng thái hiển thị popup */
  open: boolean;
  /** Đóng popup */
  onClose: () => void;
  /** Ngày bắt đầu ban đầu (YYYY-MM-DD) */
  from?: string;
  /** Ngày kết thúc ban đầu (YYYY-MM-DD) */
  to?: string;
  /** Callback khi người dùng bấm Áp dụng */
  onApply: (range: DateRange) => void;
  /** Tiêu đề popup */
  title?: string;
  /** Các preset chọn nhanh */
  presets?: DateRangePreset[];
  /** Thông báo lỗi từ ngoài truyền vào (nếu có) */
  error?: string;
}

/**
 * DateRangePicker component hiển thị popup chọn khoảng ngày (start & end date)
 * kèm các preset nhanh, tự động kiểm tra tính hợp lệ và không làm vỡ bố cục ngang.
 */
export function DateRangePicker({
  open,
  onClose,
  from = "",
  to = "",
  onApply,
  title = "Chọn khoảng ngày",
  presets = DEFAULT_PRESETS,
  error: externalError,
}: DateRangePickerProps) {
  const [tempFrom, setTempFrom] = useState(from);
  const [tempTo, setTempTo] = useState(to);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Đồng bộ giá trị khi mở popup
  useEffect(() => {
    if (open) {
      setTempFrom(from);
      setTempTo(to);
    }
  }, [open, from, to]);

  // Xử lý Escape và click outside
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;

  const isInvalidRange = Boolean(
    tempFrom && tempTo && new Date(tempFrom) > new Date(tempTo),
  );
  const validationError = isInvalidRange
    ? "Ngày bắt đầu phải trước hoặc cùng ngày kết thúc."
    : externalError;

  const handleApply = () => {
    if (isInvalidRange) return;
    onApply({ from: tempFrom, to: tempTo });
    onClose();
  };

  const handleSelectPreset = (preset: DateRangePreset) => {
    const range = preset.getRange();
    setTempFrom(range.from);
    setTempTo(range.to);
  };

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 animate-in fade-in duration-150"
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="date-range-title"
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-line p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h3
            id="date-range-title"
            className="text-lg font-head font-bold text-ink"
          >
            {title}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-lg flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <svg
              className="size-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Presets */}
        {presets && presets.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wider">
              Chọn nhanh
            </span>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#f1f3f6] text-ink hover:bg-brand-tint hover:text-brand-dark transition-colors cursor-pointer"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DatePicker
            id="date-from"
            label="Từ ngày"
            value={tempFrom}
            onChange={setTempFrom}
            max={tempTo || undefined}
          />
          <DatePicker
            id="date-to"
            label="Đến ngày"
            value={tempTo}
            onChange={setTempTo}
            min={tempFrom || undefined}
          />
        </div>

        {/* Validation Error */}
        {validationError && (
          <p className="text-xs font-medium text-err" aria-live="polite">
            {validationError}
          </p>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setTempFrom("");
              setTempTo("");
            }}
            className="text-muted hover:text-ink px-2"
          >
            Đặt lại
          </Button>
          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleApply}
              disabled={isInvalidRange || (!tempFrom && !tempTo)}
            >
              Áp dụng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
