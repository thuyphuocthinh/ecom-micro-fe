import type { ProductFilterParams } from "@/types";

/**
 * Centralized Query Key Factory for Catalog.
 * Follows the query key factory pattern for consistent caching,
 * type-safety, and predictable invalidation across apps.
 */
export const queryKeys = {
  products: {
    all: ["products"] as const,
    list: (filters: ProductFilterParams = {}) =>
      [...queryKeys.products.all, "list", filters] as const,
    detail: (id: string | undefined) =>
      [...queryKeys.products.all, "detail", id] as const,
    facets: (filters: ProductFilterParams = {}) =>
      [...queryKeys.products.all, "facets", filters] as const,
    related: (
      categoryId: string | undefined,
      currentProductId: string | undefined,
    ) =>
      [
        ...queryKeys.products.all,
        "related",
        categoryId,
        currentProductId,
      ] as const,
  },
  categories: {
    all: ["categories"] as const,
    list: (parentId?: string) =>
      [...queryKeys.categories.all, "list", parentId] as const,
    detail: (id: string | undefined) =>
      [...queryKeys.categories.all, "detail", id] as const,
  },
} as const;
