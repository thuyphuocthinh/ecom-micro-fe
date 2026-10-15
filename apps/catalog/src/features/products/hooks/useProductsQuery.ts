import { keepPreviousData, useInfiniteQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { Product, ProductFilterParams, ProductsPageMeta } from "@/types";

export interface ProductsPageData {
  products: Product[];
  meta: ProductsPageMeta;
}

export function useProductsQuery(
  filters: ProductFilterParams = {},
  limit = 12,
) {
  const isNumberedPaging = Boolean(filters.sort) && filters.sort !== "newest";

  return useInfiniteQuery<ProductsPageData, Error>({
    queryKey: queryKeys.products.list(filters),
    // Changing a filter or the sort keeps showing the previous results (flagged `isPlaceholderData`)
    // until the new ones arrive, instead of dropping the list for a skeleton (AC-10)
    placeholderData: keepPreviousData,
    initialPageParam: isNumberedPaging ? 1 : undefined,
    queryFn: async ({ pageParam }) => {
      const res = await productService.getProducts({
        ...filters,
        limit,
        page: isNumberedPaging ? (pageParam as number) : undefined,
        cursor: !isNumberedPaging
          ? (pageParam as string | undefined)
          : undefined,
      });

      return {
        products: res.data ?? [],
        meta: res.meta ?? {},
      };
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.meta?.hasMore) return undefined;

      if (isNumberedPaging) {
        const currentPage = lastPage.meta?.page ?? 1;
        return currentPage + 1;
      }

      return lastPage.meta?.nextCursor || undefined;
    },
  });
}
