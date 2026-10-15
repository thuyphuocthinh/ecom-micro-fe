import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/constants/queryKeys.ts";
import { catalogService } from "@/services/catalog.service.ts";

/** Ten minutes: categories hardly ever change. */
export const CATEGORIES_STALE_MS = 1000 * 60 * 10;

/**
 * The root categories from the API. The header and the home page both use this one query (one key), so
 * the API is asked once for both.
 */
export function useRootCategoriesQuery() {
  return useQuery({
    queryKey: queryKeys.catalog.categories(),
    queryFn: () => catalogService.getCategories(),
    staleTime: CATEGORIES_STALE_MS,
  });
}
