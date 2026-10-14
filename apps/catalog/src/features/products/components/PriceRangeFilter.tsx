import { useState, type FormEvent } from "react";
import { Button } from "@ecom/ui";

export interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onApply: (range: { minPrice?: number; maxPrice?: number }) => void;
  onClear: () => void;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  onApply,
  onClear,
}: PriceRangeFilterProps) {
  const [localMin, setLocalMin] = useState<string>(
    minPrice !== undefined ? String(minPrice) : "",
  );
  const [localMax, setLocalMax] = useState<string>(
    maxPrice !== undefined ? String(maxPrice) : "",
  );
  const [error, setError] = useState<string | null>(null);

  // Adjust state when props change (e.g. from URL or clear)
  const [prevMin, setPrevMin] = useState(minPrice);
  const [prevMax, setPrevMax] = useState(maxPrice);
  if (prevMin !== minPrice || prevMax !== maxPrice) {
    setPrevMin(minPrice);
    setPrevMax(maxPrice);
    setLocalMin(minPrice !== undefined ? String(minPrice) : "");
    setLocalMax(maxPrice !== undefined ? String(maxPrice) : "");
    setError(null);
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const min = localMin.trim() ? Number(localMin) : undefined;
    const max = localMax.trim() ? Number(localMax) : undefined;

    if (min !== undefined && isNaN(min)) {
      setError("Giá tối thiểu không hợp lệ");
      return;
    }
    if (max !== undefined && isNaN(max)) {
      setError("Giá tối đa không hợp lệ");
      return;
    }

    if (min !== undefined && max !== undefined && min > max) {
      setError("Giá tối thiểu phải nhỏ hơn hoặc bằng giá tối đa");
      return;
    }

    setError(null);
    onApply({ minPrice: min, maxPrice: max });
  };

  const handleClear = () => {
    setLocalMin("");
    setLocalMax("");
    setError(null);
    onClear();
  };

  const hasFilter = minPrice !== undefined || maxPrice !== undefined;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
          Khoảng giá
        </h3>
        {hasFilter && (
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-semibold text-brand hover:underline cursor-pointer"
          >
            Xóa
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0">
          <label htmlFor="min-price" className="sr-only">
            Giá tối thiểu
          </label>
          <input
            id="min-price"
            type="number"
            min="0"
            step="10000"
            placeholder="Từ ₫"
            value={localMin}
            onChange={(e) => {
              setLocalMin(e.target.value);
              setError(null);
            }}
            className="w-full px-3 py-1.5 text-sm rounded-control border border-field-border bg-white text-ink focus:border-brand focus:outline-none tnum"
          />
        </div>

        <span className="text-muted text-xs select-none">—</span>

        <div className="flex-1 min-w-0">
          <label htmlFor="max-price" className="sr-only">
            Giá tối đa
          </label>
          <input
            id="max-price"
            type="number"
            min="0"
            step="10000"
            placeholder="Đến ₫"
            value={localMax}
            onChange={(e) => {
              setLocalMax(e.target.value);
              setError(null);
            }}
            className="w-full px-3 py-1.5 text-sm rounded-control border border-field-border bg-white text-ink focus:border-brand focus:outline-none tnum"
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="text-xs font-medium text-err">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="secondary"
        size="md"
        className="w-full justify-center"
      >
        Áp dụng giá
      </Button>
    </form>
  );
}
