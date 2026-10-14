import type { ProductSortOption } from "@/types";

export interface ProductSortSelectProps {
  value?: ProductSortOption;
  onChange: (sort: ProductSortOption) => void;
  hasSearchQuery?: boolean;
}

export function ProductSortSelect({
  value = "newest",
  onChange,
  hasSearchQuery = false,
}: ProductSortSelectProps) {
  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="product-sort"
        className="text-sm font-semibold text-ink shrink-0"
      >
        Sắp xếp<span className="sr-only">:</span>
      </label>
      <select
        id="product-sort"
        aria-label="Sắp xếp:"
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        className="min-h-[42px] px-3 py-1.5 rounded-[10px] border border-line bg-white text-[14.5px] font-medium text-ink focus:border-brand focus:outline-none cursor-pointer transition-colors"
      >
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá thấp đến cao</option>
        <option value="price_desc">Giá cao đến thấp</option>
        {hasSearchQuery && <option value="relevance">Liên quan nhất</option>}
      </select>
    </div>
  );
}
