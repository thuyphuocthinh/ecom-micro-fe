import { useState, useMemo } from "react";
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

  // TanStack Queries
  const { data: categories = [] } = useCategoriesQuery();
  const { data: facets = [] } = useProductFacetsQuery(filters);
  const {
    data: productsData,
    isLoading,
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

  // Current category name for title
  const activeCategoryName = currentCategory
    ? categoryNames[currentCategory] ||
      facets.find((f) => f.categoryId === currentCategory)?.name
    : undefined;

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

  // Filter Handlers
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
    setSearchParams((prev) => {
      const next = new URLSearchParams();
      const q = prev.get("q");
      if (q) next.set("q", q);
      return next;
    });
  };

  // Cross-app Add to cart event
  const handleAddToCart = (product: Product) => {
    window.dispatchEvent(
      new CustomEvent("cart:add", { detail: { productId: product.id } }),
    );
    window.dispatchEvent(new CustomEvent("cart:changed"));
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng`);
  };

  // Total products from latest page meta or products length
  const totalCount = productsData?.pages[0]?.meta?.total ?? products.length;

  return (
    <div className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-16 flex flex-col gap-6">
      {/* Top Header & Breadcrumb / Search title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-line/60">
        <div>
          <h1 className="font-head text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {currentQ
              ? `Kết quả tìm kiếm cho “${currentQ}”`
              : activeCategoryName
                ? activeCategoryName
                : "Tất cả sản phẩm"}
          </h1>
          <p aria-live="polite" className="tnum text-[14.5px] text-muted mt-1">
            {isLoading ? "Đang tải sản phẩm..." : `${totalCount} sản phẩm`}
          </p>
        </div>

        {/* Toolbar: Mobile Filter Trigger & Sort Dropdown */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mobile Filter Toggle */}
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => setIsDrawerOpen(true)}
            className="lg:hidden flex items-center gap-2"
          >
            <Icon name="search" size={16} />
            <span>Bộ lọc</span>
            {activeFiltersCount > 0 && (
              <span className="size-5 rounded-full bg-brand text-white text-xs font-bold inline-flex items-center justify-center">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Sort Selector */}
          <ProductSortSelect
            value={currentSort}
            onChange={handleSortChange}
            hasSearchQuery={Boolean(currentQ.trim())}
          />
        </div>
      </div>

      {/* Main Layout: Filters Sidebar (Desktop) + Product Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] gap-8 items-start">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block sticky top-6">
          <ProductFiltersSidebar
            facets={facets}
            filters={filters}
            totalProductsCount={totalCount}
            onCategoryChange={handleCategoryChange}
            onPriceRangeChange={handlePriceRangeChange}
            onInStockChange={handleInStockChange}
            onOnSaleChange={handleOnSaleChange}
            onClearAll={handleClearAllFilters}
          />
        </div>

        {/* Products Content Area */}
        <div className="flex flex-col gap-8 min-w-0">
          <ProductGrid
            products={products}
            categoryNames={categoryNames}
            isLoading={isLoading}
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

      {/* Mobile Drawer */}
      <ProductFiltersDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        facets={facets}
        filters={filters}
        totalProductsCount={totalCount}
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
