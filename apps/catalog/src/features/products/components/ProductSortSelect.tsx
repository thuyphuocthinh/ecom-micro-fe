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
        className="text-sm font-medium text-muted shrink-0"
      >
        Sắp xếp:
      </label>
      <select
        id="product-sort"
        value={value}
        onChange={(e) => onChange(e.target.value as ProductSortOption)}
        className="px-3 py-1.5 rounded-control border border-field-border bg-white text-sm font-medium text-ink focus:border-brand focus:outline-none cursor-pointer"
      >
        <option value="newest">Mới nhất</option>
        <option value="price_asc">Giá: Thấp đến cao</option>
        <option value="price_desc">Giá: Cao đến thấp</option>
        {hasSearchQuery && <option value="relevance">Phù hợp nhất</option>}
      </select>
    </div>
  );
}
