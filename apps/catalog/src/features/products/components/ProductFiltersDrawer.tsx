import { useEffect } from "react";
import { Button } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import { ProductFiltersSidebar } from "./ProductFiltersSidebar.tsx";
import type { CategoryFacet, ProductFilterParams } from "@/types";

export interface ProductFiltersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  facets: CategoryFacet[];
  filters: ProductFilterParams;
  totalProductsCount?: number;
  onCategoryChange: (categoryId: string | undefined) => void;
  onPriceRangeChange: (range: { minPrice?: number; maxPrice?: number }) => void;
  onInStockChange: (inStock: boolean) => void;
  onOnSaleChange: (onSale: boolean) => void;
  onClearAll: () => void;
}

export function ProductFiltersDrawer({
  isOpen,
  onClose,
  facets,
  filters,
  totalProductsCount,
  onCategoryChange,
  onPriceRangeChange,
  onInStockChange,
  onOnSaleChange,
  onClearAll,
}: ProductFiltersDrawerProps) {
  // Prevent background scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Bộ lọc tìm kiếm"
      className="fixed inset-0 z-50 flex justify-end lg:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer content: slides in from right or bottom, bounded max-width */}
      <div className="relative bg-white w-full max-w-[420px] h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 px-6 border-b border-line">
          <h2 className="font-head text-lg font-bold text-ink">
            Bộ lọc tìm kiếm
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng bộ lọc"
            className="size-9 rounded-full inline-flex items-center justify-center text-muted hover:text-ink hover:bg-canvas transition-colors cursor-pointer"
          >
            <Icon name="x-circle" size={20} />
          </button>
        </div>

        {/* Scrollable Filters Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <ProductFiltersSidebar
            facets={facets}
            filters={filters}
            totalProductsCount={totalProductsCount}
            onCategoryChange={onCategoryChange}
            onPriceRangeChange={onPriceRangeChange}
            onInStockChange={onInStockChange}
            onOnSaleChange={onOnSaleChange}
            onClearAll={onClearAll}
          />
        </div>

        {/* Footer Apply Button */}
        <div className="p-4 px-6 border-t border-line bg-white flex gap-3">
          <Button
            type="button"
            variant="primary"
            size="lg"
            onClick={onClose}
            className="flex-1 justify-center"
          >
            {typeof totalProductsCount === "number"
              ? `Xem ${totalProductsCount} sản phẩm`
              : "Áp dụng"}
          </Button>
        </div>
      </div>
    </div>
  );
}
