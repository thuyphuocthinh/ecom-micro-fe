import { type ChangeEvent } from "react";
import {
  Button,
  Dropdown,
  type DropdownOption,
  SearchInput,
  TextField,
} from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import type { OrderRangeKey } from "@/types";

const RANGE_OPTIONS: DropdownOption[] = [
  { value: "all", label: "Tất cả" },
  { value: "30d", label: "30 ngày qua" },
  { value: "3m", label: "3 tháng qua" },
  { value: "year", label: "Năm nay" },
  { value: "custom", label: "Chọn khoảng ngày…" },
];

export interface OrderFiltersBarProps {
  range: OrderRangeKey;
  from?: string;
  to?: string;
  q: string;
  rangeError?: string;
  onRangeChange: (range: OrderRangeKey) => void;
  onFromChange: (from: string) => void;
  onToChange: (to: string) => void;
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
  onQChange,
  onClearFilters,
}: OrderFiltersBarProps) {
  const isCustom = range === "custom";
  const hasFilter =
    range !== "all" || Boolean(from) || Boolean(to) || Boolean(q.trim());
  const trimmedQ = q.trim();
  const qHint =
    trimmedQ && trimmedQ.length < 6
      ? "Nhập ít nhất 6 ký tự của mã đơn."
      : "Mã đơn là 8 ký tự đầu, như trên mỗi đơn.";

  return (
    <div className="flex flex-col gap-2">
      <div
        role="search"
        aria-label="Lọc đơn hàng"
        className="flex gap-3 flex-wrap items-end"
      >
        {/* Thời gian đặt */}
        <div className="w-full sm:w-[200px]">
          <Dropdown
            id="rng"
            label="Thời gian đặt"
            options={RANGE_OPTIONS}
            value={range}
            onChange={(val) => onRangeChange(val as OrderRangeKey)}
          />
        </div>

        {/* Custom Date Range */}
        {isCustom && (
          <>
            <div className="flex flex-col gap-1.5 w-full sm:w-[170px]">
              <TextField
                id="df"
                label="Từ ngày"
                type="date"
                value={from}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onFromChange(e.target.value)
                }
                error={rangeError || undefined}
              />
            </div>
            <div className="flex flex-col gap-1.5 w-full sm:w-[170px]">
              <TextField
                id="dt"
                label="Đến ngày"
                type="date"
                value={to}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  onToChange(e.target.value)
                }
                error={rangeError || undefined}
              />
            </div>
          </>
        )}

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
            onClick={onClearFilters}
            className="text-muted hover:text-ink min-h-[46px] self-end mb-[18px]"
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
