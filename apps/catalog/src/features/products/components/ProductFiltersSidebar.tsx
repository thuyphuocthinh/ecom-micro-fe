import { Card, Button } from "@ecom/ui";
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
      aria-label="Bộ lọc sản phẩm"
      className={`w-full flex flex-col gap-6 ${className}`}
    >
      <Card className="p-5 sm:p-6 flex flex-col gap-6 bg-white border border-line rounded-2xl shadow-xs">
        {/* Header with Clear button */}
        <div className="flex items-center justify-between pb-3 border-b border-line">
          <h2 className="font-head text-base sm:text-lg font-bold text-ink">
            Bộ lọc tìm kiếm
          </h2>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs font-semibold text-brand hover:underline cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Categories Facets */}
        <CategoryFacetList
          facets={facets}
          selectedCategoryId={filters.categoryId}
          onSelectCategory={onCategoryChange}
          totalCount={totalProductsCount}
        />

        <hr className="border-line/60" />

        {/* Price Range Filter */}
        <PriceRangeFilter
          minPrice={filters.minPrice}
          maxPrice={filters.maxPrice}
          onApply={onPriceRangeChange}
          onClear={() =>
            onPriceRangeChange({ minPrice: undefined, maxPrice: undefined })
          }
        />

        <hr className="border-line/60" />

        {/* Quick Toggles */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-bold text-ink uppercase tracking-wider">
            Tình trạng
          </h3>

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.inStock === true || filters.inStock === "true"}
              onChange={(e) => onInStockChange(e.target.checked)}
              className="size-4.5 rounded text-brand focus:ring-brand border-field-border cursor-pointer accent-brand"
            />
            <span>Chỉ sản phẩm còn hàng</span>
          </label>

          <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              checked={filters.onSale === true || filters.onSale === "true"}
              onChange={(e) => onOnSaleChange(e.target.checked)}
              className="size-4.5 rounded text-brand focus:ring-brand border-field-border cursor-pointer accent-brand"
            />
            <span>Đang giảm giá</span>
          </label>
        </div>

        {hasActiveFilters && (
          <Button
            type="button"
            variant="ghost"
            size="md"
            onClick={onClearAll}
            className="w-full text-muted hover:text-ink border border-line"
          >
            Đặt lại bộ lọc
          </Button>
        )}
      </Card>
    </aside>
  );
}
