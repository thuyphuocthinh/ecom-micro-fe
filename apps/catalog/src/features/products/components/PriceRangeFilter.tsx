import { useState, type FormEvent } from "react";
import { Button } from "@ecom/ui";

export interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  onApply: (range: { minPrice?: number; maxPrice?: number }) => void;
  onClear: () => void;
}

const PRESETS = [
  { id: "all", label: "Tất cả mức giá", min: undefined, max: undefined },
  { id: "lt500", label: "Dưới 500.000 ₫", min: undefined, max: 500000 },
  {
    id: "mid",
    label: "500.000 ₫ đến 1.500.000 ₫",
    min: 500000,
    max: 1500000,
  },
  { id: "gt1500", label: "Trên 1.500.000 ₫", min: 1500000, max: undefined },
];

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

  // Sync state if props change from outside
  const [prevMin, setPrevMin] = useState(minPrice);
  const [prevMax, setPrevMax] = useState(maxPrice);
  if (prevMin !== minPrice || prevMax !== maxPrice) {
    setPrevMin(minPrice);
    setPrevMax(maxPrice);
    setLocalMin(minPrice !== undefined ? String(minPrice) : "");
    setLocalMax(maxPrice !== undefined ? String(maxPrice) : "");
    setError(null);
  }

  // Determine which preset is active
  const activePreset = PRESETS.find((p) => {
    if (p.id === "all") return minPrice === undefined && maxPrice === undefined;
    return p.min === minPrice && p.max === maxPrice;
  })?.id;

  const handleSelectPreset = (presetId: string) => {
    const preset = PRESETS.find((p) => p.id === presetId);
    if (!preset || preset.id === "all") {
      setLocalMin("");
      setLocalMax("");
      setError(null);
      onClear();
      return;
    }
    setLocalMin(preset.min !== undefined ? String(preset.min) : "");
    setLocalMax(preset.max !== undefined ? String(preset.max) : "");
    setError(null);
    onApply({ minPrice: preset.min, maxPrice: preset.max });
  };

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
    <fieldset className="border-0 p-0 m-0 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <legend className="font-head font-bold text-lg text-ink mb-1.5 p-0">
          Khoảng giá
        </legend>
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

      {/* Preset Radio Options (from storefront mockup) */}
      <div className="flex flex-col">
        {PRESETS.map((preset) => {
          const isChecked =
            activePreset === preset.id ||
            (!activePreset && preset.id === "all" && !hasFilter);

          return (
            <label
              key={preset.id}
              className="flex items-center gap-3 min-h-[40px] cursor-pointer text-[15px] hover:text-brand group"
            >
              <input
                type="radio"
                name="price_preset"
                checked={isChecked}
                onChange={() => handleSelectPreset(preset.id)}
                className="size-4.5 text-brand focus:ring-brand border-line cursor-pointer accent-brand"
              />
              <span
                className={`tnum text-ink group-hover:text-brand transition-colors ${
                  isChecked ? "font-semibold text-brand" : ""
                }`}
              >
                {preset.label}
              </span>
            </label>
          );
        })}
      </div>

      {/* Custom Min / Max Inputs */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-2.5 pt-1">
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
              className="w-full px-3 py-1.5 text-sm rounded-[8px] border border-line bg-white text-ink focus:border-brand focus:outline-none tnum"
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
              className="w-full px-3 py-1.5 text-sm rounded-[8px] border border-line bg-white text-ink focus:border-brand focus:outline-none tnum"
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
          className="w-full justify-center text-xs font-semibold"
        >
          Áp dụng giá
        </Button>
      </form>
    </fieldset>
  );
}
