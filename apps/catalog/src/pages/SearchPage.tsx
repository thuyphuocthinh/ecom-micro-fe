import { useState, useMemo, type FormEvent } from "react";
import { useSearchParams } from "react-router";
import { Button } from "@ecom/ui";
import { toast } from "sonner";
import { Icon } from "@/components/common/Icon.tsx";
import {
  ProductGrid,
  ProductSortSelect,
  ProductFiltersSidebar,
  ProductFiltersDrawer,
} from "@/features/products/components";
import {
  useProductsQuery,
  useProductFacetsQuery,
  useCategoriesQuery,
} from "@/features/products/hooks";
import { formatVnd } from "@/features/products/utils/product-format.ts";
import type { Product, ProductFilterParams, ProductSortOption } from "@/types";

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Read search params
  const currentQ = searchParams.get("q") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentMinPrice = searchParams.get("minPrice")
    ? Number(searchParams.get("minPrice"))
    : undefined;
  const currentMaxPrice = searchParams.get("maxPrice")
    ? Number(searchParams.get("maxPrice"))
    : undefined;
  const currentInStock = searchParams.get("inStock") === "true";
  const currentOnSale = searchParams.get("onSale") === "true";
  const currentSort =
    (searchParams.get("sort") as ProductSortOption) || "newest";

  // Refinement keyword search state
  const [keywordInput, setKeywordInput] = useState(currentQ);
  // Keep keyword input in sync when URL changes
  const [prevQ, setPrevQ] = useState(currentQ);
  if (prevQ !== currentQ) {
    setPrevQ(currentQ);
    setKeywordInput(currentQ);
  }

  // Filter parameters object for TanStack Query
  const filters = useMemo<ProductFilterParams>(
    () => ({
      search: currentQ.trim() || undefined,
      categoryId: currentCategory || undefined,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      inStock: currentInStock ? "true" : undefined,
      onSale: currentOnSale ? "true" : undefined,
      sort: currentSort,
    }),
    [
      currentQ,
      currentCategory,
      currentMinPrice,
      currentMaxPrice,
      currentInStock,
      currentOnSale,
      currentSort,
    ],
  );

  // Filter parameters for Facets Query (facets count across all categories matching search, price, stock, sale)
  const facetFilters = useMemo<ProductFilterParams>(
    () => ({
      search: currentQ.trim() || undefined,
      minPrice: currentMinPrice,
      maxPrice: currentMaxPrice,
      inStock: currentInStock ? "true" : undefined,
      onSale: currentOnSale ? "true" : undefined,
    }),
    [currentQ, currentMinPrice, currentMaxPrice, currentInStock, currentOnSale],
  );

  // TanStack Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: facets = [] } = useProductFacetsQuery(facetFilters);
  const {
    data: productsData,
    isLoading,
    isFetching,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductsQuery(filters, 12);

  // Flattened products array
  const products = useMemo(
    () => productsData?.pages.flatMap((page) => page.products) ?? [],
    [productsData],
  );

  // Category ID to Name mapping
  const categoryNames = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of categories) {
      map[cat.id] = cat.name;
    }
    return map;
  }, [categories]);

  // Current category name for title & chips
  const activeCategoryName = currentCategory
    ? categoryNames[currentCategory] ||
      facets.find((f) => f.categoryId === currentCategory)?.name
    : undefined;

  // Active filters detection
  const hasActiveFilters = Boolean(
    currentQ.trim() ||
    currentCategory ||
    currentMinPrice !== undefined ||
    currentMaxPrice !== undefined ||
    currentInStock ||
    currentOnSale,
  );

  // Active filters count for mobile badge
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (currentCategory) count++;
    if (currentMinPrice !== undefined || currentMaxPrice !== undefined) count++;
    if (currentInStock) count++;
    if (currentOnSale) count++;
    return count;
  }, [
    currentCategory,
    currentMinPrice,
    currentMaxPrice,
    currentInStock,
    currentOnSale,
  ]);

  // Price Chip Label
  const priceChipLabel = useMemo(() => {
    if (currentMinPrice === undefined && currentMaxPrice === undefined) {
      return null;
    }
    if (currentMinPrice !== undefined && currentMaxPrice !== undefined) {
      return `${formatVnd(currentMinPrice)} – ${formatVnd(currentMaxPrice)}`;
    }
    if (currentMinPrice !== undefined) {
      return `Từ ${formatVnd(currentMinPrice)}`;
    }
    if (currentMaxPrice !== undefined) {
      return `Dưới ${formatVnd(currentMaxPrice)}`;
    }
    return null;
  }, [currentMinPrice, currentMaxPrice]);

  // Handlers for URL Params updates
  const handleKeywordSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (keywordInput.trim()) {
        next.set("q", keywordInput.trim());
      } else {
        next.delete("q");
      }
      return next;
    });
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (categoryId) next.set("category", categoryId);
      else next.delete("category");
      return next;
    });
  };

  const handlePriceRangeChange = (range: {
    minPrice?: number;
    maxPrice?: number;
  }) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (range.minPrice !== undefined) {
        next.set("minPrice", String(range.minPrice));
      } else {
        next.delete("minPrice");
      }
      if (range.maxPrice !== undefined) {
        next.set("maxPrice", String(range.maxPrice));
      } else {
        next.delete("maxPrice");
      }
      return next;
    });
  };

  const handleInStockChange = (inStock: boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (inStock) next.set("inStock", "true");
      else next.delete("inStock");
      return next;
    });
  };

  const handleOnSaleChange = (onSale: boolean) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (onSale) next.set("onSale", "true");
      else next.delete("onSale");
      return next;
    });
  };

  const handleSortChange = (sort: ProductSortOption) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (sort === "newest") next.delete("sort");
      else next.set("sort", sort);
      return next;
    });
  };

  const handleClearAllFilters = () => {
    setSearchParams(new URLSearchParams());
    setKeywordInput("");
  };

  const handleRemoveQuery = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.delete("q");
      return next;
    });
    setKeywordInput("");
  };

  // Cross-app Add to cart event
  const handleAddToCart = (product: Product) => {
    window.dispatchEvent(
      new CustomEvent("cart:add", { detail: { productId: product.id } }),
    );
    window.dispatchEvent(new CustomEvent("cart:changed"));
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  // Category facets total count (sum of all category facet counts)
  const facetsTotalCount = useMemo(
    () => facets.reduce((sum, f) => sum + (f.count || 0), 0),
    [facets],
  );

  // Active category facet count
  const activeCategoryCount = useMemo(() => {
    if (!currentCategory) return facetsTotalCount;
    const matched = facets.find((f) => f.categoryId === currentCategory);
    return matched ? matched.count : undefined;
  }, [currentCategory, facets, facetsTotalCount]);

  // Total products from latest page meta or facets or products length
  const totalCount = useMemo(() => {
    const metaTotal = productsData?.pages[0]?.meta?.total;
    if (typeof metaTotal === "number") return metaTotal;
    if (facets.length > 0) {
      if (currentCategory) {
        return activeCategoryCount ?? products.length;
      }
      return facetsTotalCount;
    }
    return products.length;
  }, [
    productsData,
    facets,
    currentCategory,
    activeCategoryCount,
    facetsTotalCount,
    products.length,
  ]);

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-20 flex flex-col gap-6">
      {/* Breadcrumb (Matches storefront mock) */}
      <nav
        aria-label="Đường dẫn"
        className="text-[14px] text-[#5b6472] flex items-center gap-1.5"
      >
        <a href="/" className="hover:text-ink text-[#5b6472] no-underline">
          Trang chủ
        </a>
        <span aria-hidden="true" className="text-muted/60">
          /
        </span>
        <span aria-current="page" className="text-ink font-medium">
          Tìm kiếm
        </span>
      </nav>

      {/* Top Header & Refinement Toolbar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 pb-3 border-b border-line/60">
        <div>
          <h1 className="font-head text-3xl sm:text-[38px] font-bold text-ink tracking-tight leading-tight">
            {currentQ
              ? `Kết quả tìm kiếm cho “${currentQ}”`
              : activeCategoryName
                ? activeCategoryName
                : "Tất cả sản phẩm"}
          </h1>
          <p
            aria-live="polite"
            className="tnum text-[15px] text-[#5b6472] mt-1"
          >
            {isLoading
              ? "Đang tải sản phẩm..."
              : `${totalCount} sản phẩm${hasActiveFilters ? " sau khi lọc" : ""}`}
          </p>
        </div>

        {/* Toolbar: Refinement Input, Sort Select & Mobile Filter Toggle */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Refine Search Input */}
          <form
            onSubmit={handleKeywordSubmit}
            className="w-full sm:w-[240px] md:w-[260px]"
          >
            <label className="sr-only" htmlFor="kw">
              Lọc theo từ khoá
            </label>
            <input
              id="kw"
              type="search"
              name="q"
              autoComplete="off"
              spellCheck="false"
              placeholder="Thu hẹp kết quả, ví dụ: tai nghe…"
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              className="w-full min-h-[42px] px-3.5 rounded-[10px] border border-line bg-white text-ink text-[14.5px] placeholder:text-[#7a8392] focus:border-brand focus:outline-none transition-colors"
            />
          </form>

          {/* Sort Selector */}
          <ProductSortSelect
            value={currentSort}
            onChange={handleSortChange}
            hasSearchQuery={Boolean(currentQ.trim())}
          />

          {/* Mobile Filter Toggle */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2 min-h-[42px] rounded-[10px]"
          >
            <Icon name="search" size={16} />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="size-5 rounded-full bg-brand text-white text-xs font-bold inline-flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Active Filter Chips (from storefront mock) */}
      {hasActiveFilters && (
        <div
          className="flex items-center gap-2 flex-wrap"
          aria-label="Bộ lọc đang dùng"
        >
          {currentQ && (
            <button
              type="button"
              onClick={handleRemoveQuery}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-[#eaf0ff] text-[#2559c9] font-semibold text-[13.5px] cursor-pointer hover:bg-[#d7e2ff] transition-colors border-0"
              aria-label={`Bỏ lọc Từ khoá: ${currentQ}`}
            >
              <span>Từ khoá: {currentQ}</span>
              <Icon name="x" size={14} />
            </button>
          )}

          {currentCategory && (
            <button
              type="button"
              onClick={() => handleCategoryChange(undefined)}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-[#eaf0ff] text-[#2559c9] font-semibold text-[13.5px] cursor-pointer hover:bg-[#d7e2ff] transition-colors border-0"
              aria-label={`Bỏ lọc ${activeCategoryName || "Danh mục"}`}
            >
              <span>{activeCategoryName || "Danh mục"}</span>
              <Icon name="x" size={14} />
            </button>
          )}

          {priceChipLabel && (
            <button
              type="button"
              onClick={() =>
                handlePriceRangeChange({
                  minPrice: undefined,
                  maxPrice: undefined,
                })
              }
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-[#eaf0ff] text-[#2559c9] font-semibold text-[13.5px] cursor-pointer hover:bg-[#d7e2ff] transition-colors border-0"
              aria-label={`Bỏ lọc ${priceChipLabel}`}
            >
              <span>{priceChipLabel}</span>
              <Icon name="x" size={14} />
            </button>
          )}

          {currentOnSale && (
            <button
              type="button"
              onClick={() => handleOnSaleChange(false)}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-[#eaf0ff] text-[#2559c9] font-semibold text-[13.5px] cursor-pointer hover:bg-[#d7e2ff] transition-colors border-0"
              aria-label="Bỏ lọc Đang giảm giá"
            >
              <span>Đang giảm giá</span>
              <Icon name="x" size={14} />
            </button>
          )}

          {currentInStock && (
            <button
              type="button"
              onClick={() => handleInStockChange(false)}
              className="inline-flex items-center gap-1.5 min-h-[36px] px-3.5 rounded-full bg-[#eaf0ff] text-[#2559c9] font-semibold text-[13.5px] cursor-pointer hover:bg-[#d7e2ff] transition-colors border-0"
              aria-label="Bỏ lọc Chỉ sản phẩm còn hàng"
            >
              <span>Còn hàng</span>
              <Icon name="x" size={14} />
            </button>
          )}
        </div>
      )}

      {/* Main Layout: Filters Sidebar (Desktop) + Product Grid */}
      <div className="flex gap-10 items-start">
        {/* Desktop Sidebar: Sticky, unboxed modern layout */}
        <div className="hidden lg:block sticky top-6 shrink-0">
          <ProductFiltersSidebar
            facets={facets}
            filters={filters}
            totalProductsCount={facetsTotalCount}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onInStockChange={handleInStockChange}
            onOnSaleChange={handleOnSaleChange}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Products Content Area */}
        <div className="flex-1 min-w-0 flex flex-col gap-8">
          <ProductGrid
            products={products}
            categoryNames={categoryNames}
            isLoading={isLoading}
            isFetching={isFetching}
            onAddToCart={handleAddToCart}
            onClearFilters={handleClearAllFilters}
          />

          {/* Load More Pagination */}
          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button
                type="button"
                variant="secondary"
                size="lg"
                loading={isFetchingNextPage}
                onClick={() => fetchNextPage()}
                className="w-full sm:w-auto min-w-[220px]"
              >
                Xem thêm sản phẩm
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Polished modal slide-in) */}
      <ProductFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        facets={facets}
        filters={filters}
        totalProductsCount={facetsTotalCount}
        onCategoryChange={handleCategoryChange}
        onPriceRangeChange={handlePriceRangeChange}
        onInStockChange={handleInStockChange}
        onOnSaleChange={handleOnSaleChange}
        onClearAll={handleClearAllFilters}
      />
    </div>
  );
}

export default SearchPage;
