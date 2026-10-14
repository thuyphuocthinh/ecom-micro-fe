import { Button } from "@ecom/ui";
import { CategoryFacetList } from "./CategoryFacetList.tsx";
import { PriceRangeFilter } from "./PriceRangeFilter.tsx";
import type { CategoryFacet, ProductFilterParams } from "@/types";

export interface ProductFiltersSidebarProps {
  facets: CategoryFacet[];
  filters: ProductFilterParams;
  totalProductsCount?: number;
  onCategoryChange: (categoryId: string | undefined) => void;
  onPriceRangeChange: (range: { minPrice?: number; maxPrice?: number }) => void;
  onInStockChange: (inStock: boolean) => void;
  onOnSaleChange: (onSale: boolean) => void;
  onClearAll: () => void;
  className?: string;
}

export function ProductFiltersSidebar({
  facets,
  filters,
  totalProductsCount,
  onCategoryChange,
  onPriceRangeChange,
  onInStockChange,
  onOnSaleChange,
  onClearAll,
  className = "",
}: ProductFiltersSidebarProps) {
  const hasActiveFilters = Boolean(
    filters.categoryId ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.inStock === true ||
    filters.inStock === "true" ||
    filters.onSale === true ||
    filters.onSale === "true",
  );

  return (
    <aside
      aria-label="Bộ lọc"
      className={`w-full lg:w-[260px] shrink-0 flex flex-col gap-6 ${className}`}
    >
      {/* Category Facets */}
      <CategoryFacetList
        facets={facets}
        selectedCategoryId={filters.categoryId}
        onSelectCategory={onCategoryChange}
        totalCount={totalProductsCount}
      />

      <div className="h-px bg-line/60" />

      {/* Price Range Filter */}
      <PriceRangeFilter
        minPrice={filters.minPrice}
        maxPrice={filters.maxPrice}
        onApply={onPriceRangeChange}
        onClear={() =>
          onPriceRangeChange({ minPrice: undefined, maxPrice: undefined })
        }
      />

      <div className="h-px bg-line/60" />

      {/* Status Toggles (.opt style from storefront) */}
      <fieldset className="border-0 p-0 m-0 flex flex-col gap-1">
        <legend className="font-head font-bold text-lg text-ink mb-1.5 p-0">
          Tình trạng
        </legend>

        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer text-[15px] hover:text-brand group select-none">
          <input
            type="checkbox"
            checked={filters.inStock === true || filters.inStock === "true"}
            onChange={(e) => onInStockChange(e.target.checked)}
            className="size-5 rounded text-brand focus:ring-brand border-line cursor-pointer accent-brand"
          />
          <span className="text-ink group-hover:text-brand transition-colors">
            Chỉ sản phẩm còn hàng
          </span>
        </label>

        <label className="flex items-center gap-3 min-h-[44px] cursor-pointer text-[15px] hover:text-brand group select-none">
          <input
            type="checkbox"
            checked={filters.onSale === true || filters.onSale === "true"}
            onChange={(e) => onOnSaleChange(e.target.checked)}
            className="size-5 rounded text-brand focus:ring-brand border-line cursor-pointer accent-brand"
          />
          <span className="text-ink group-hover:text-brand transition-colors">
            Đang giảm giá
          </span>
        </label>
      </fieldset>

      {/* Clear all filters button if filters are active */}
      {hasActiveFilters && (
        <div className="pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={onClearAll}
            className="w-full justify-center"
          >
            Đặt lại bộ lọc
          </Button>
        </div>
      )}
    </aside>
  );
}
