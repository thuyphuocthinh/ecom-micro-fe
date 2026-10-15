import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productService } from "@/services/product.service.ts";
import { queryKeys } from "@/constants/queryKeys.ts";
import type { CategoryFacet, ProductFilterParams } from "@/types";

/** Five minutes: the counts per category change slowly, and the API call behind them is the heaviest one. */
export const FACETS_STALE_MS = 1000 * 60 * 5;

export function useProductFacetsQuery(
  filters: ProductFilterParams = {},
  parentId?: string,
) {
  return useQuery<CategoryFacet[], Error>({
    queryKey: queryKeys.products.facets(filters),
    queryFn: () => productService.getProductFacets(filters, parentId),
    staleTime: FACETS_STALE_MS,
    // The list of categories stays on screen while the counts for new filters load (no flicker)
    placeholderData: keepPreviousData,
  });
}
