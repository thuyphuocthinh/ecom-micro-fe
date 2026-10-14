import { useState } from "react";
import {
  Button,
  DateRangePicker,
  Dropdown,
  type DropdownOption,
  SearchInput,
} from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderRangeKey } from "@/types";
import { formatOrderDate } from "../utils/order-format.ts";

export interface OrderFiltersBarProps {
  range: OrderRangeKey;
  from?: string;
  to?: string;
  q: string;
  rangeError?: string;
  onRangeChange: (range: OrderRangeKey) => void;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
  onDateRangeApply?: (range: { from: string; to: string }) => void;
  onQChange: (q: string) => void;
  onClearFilters: () => void;
}

export function OrderFiltersBar({
  range,
  from = "",
  to = "",
  q,
  rangeError,
  onRangeChange,
  onFromChange,
  onToChange,
  onDateRangeApply,
  onQChange,
  onClearFilters,
}: OrderFiltersBarProps) {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const hasFilter =
    range !== "all" || Boolean(from) || Boolean(to) || Boolean(q.trim());
  const trimmedQ = q.trim();
  const qHint =
    trimmedQ && trimmedQ.length < 6
      ? "Nhập ít nhất 6 ký tự của mã đơn."
      : "Mã đơn là 8 ký tự đầu, như trên mỗi đơn.";

  const customLabel =
    from && to
      ? `${formatOrderDate(from)} – ${formatOrderDate(to)}`
      : from
        ? `Từ ${formatOrderDate(from)}`
        : to
          ? `Đến ${formatOrderDate(to)}`
          : "Chọn khoảng ngày…";

  const rangeOptions: DropdownOption[] = [
    { value: "all", label: "Tất cả" },
    { value: "30d", label: "30 ngày qua" },
    { value: "3m", label: "3 tháng qua" },
    { value: "year", label: "Năm nay" },
    { value: "custom", label: customLabel },
  ];

  const handleRangeChange = (val: string) => {
    if (val === "custom") {
      setIsDatePickerOpen(true);
    } else {
      setIsDatePickerOpen(false);
      onRangeChange(val as OrderRangeKey);
    }
  };

  const handleApplyDateRange = (newRange: { from: string; to: string }) => {
    if (onDateRangeApply) {
      onDateRangeApply(newRange);
    } else {
      onFromChange(newRange.from);
      onToChange(newRange.to);
      onRangeChange("custom");
    }
    setIsDatePickerOpen(false);
  };

  return (
    <div className="flex flex-col gap-2">
      <div
        role="search"
        aria-label="Lọc đơn hàng"
        className="flex gap-3 flex-wrap items-start"
      >
        {/* Thời gian đặt */}
        <div className="w-full sm:w-[220px]">
          <Dropdown
            id="rng"
            label="Thời gian đặt"
            options={rangeOptions}
            value={range}
            onChange={handleRangeChange}
          />
        </div>

        {/* DateRangePicker Popup */}
        <DateRangePicker
          open={isDatePickerOpen}
          from={from}
          to={to}
          error={rangeError}
          onClose={() => setIsDatePickerOpen(false)}
          onApply={handleApplyDateRange}
        />

        {/* Tìm theo mã đơn */}
        <div className="flex-1 min-w-[220px] flex flex-col gap-1.5">
          <label htmlFor="oq" className="font-semibold text-sm text-ink">
            Mã đơn
          </label>
          <SearchInput
            id="oq"
            name="q"
            autoComplete="off"
            spellCheck={false}
            placeholder="Ví dụ: 3FA85F64…"
            value={q}
            onChange={(e) => onQChange(e.target.value)}
            aria-describedby="oq-hint"
            className="min-h-[46px]"
            startAdornment={
              <Icon name="search" size={18} className="size-4 text-muted" />
            }
          />
          <p id="oq-hint" className="text-xs text-muted" aria-live="polite">
            {qHint}
          </p>
        </div>

        {/* Xoá bộ lọc */}
        {hasFilter && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setIsDatePickerOpen(false);
              onClearFilters();
            }}
            className="text-muted hover:text-ink min-h-[46px] mt-[26px]"
          >
            Xoá bộ lọc
          </Button>
        )}
      </div>

      {rangeError && (
        <p
          id="range-err"
          className="text-xs text-err font-medium"
          aria-live="polite"
        >
          {rangeError}
        </p>
      )}
    </div>
  );
}
