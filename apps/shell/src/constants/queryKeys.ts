/**
 * Centralized Query Key Factory for TanStack Query.
 * Follows the query key factory pattern for consistent caching,
 * type-safety, and predictable invalidation across apps.
 */
export const queryKeys = {
  user: {
    all: ["user"] as const,
    me: () => [...queryKeys.user.all, "me"] as const,
    addresses: () => [...queryKeys.user.all, "addresses"] as const,
  },
  cart: {
    all: ["cart"] as const,
    summary: () => [...queryKeys.cart.all, "summary"] as const,
  },
  locations: {
    all: ["locations"] as const,
    provinces: () => [...queryKeys.locations.all, "provinces"] as const,
    wards: (provinceCode: string) =>
      [...queryKeys.locations.all, "wards", provinceCode] as const,
  },
  orders: {
    all: ["orders"] as const,
    list: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, "list", filters ?? {}] as const,
    counts: (filters?: Record<string, unknown>) =>
      [...queryKeys.orders.all, "counts", filters ?? {}] as const,
    detail: (id: string) => [...queryKeys.orders.all, "detail", id] as const,
  },
  catalog: {
    all: ["catalog"] as const,
    bestsellers: (limit = 8) =>
      [...queryKeys.catalog.all, "bestsellers", limit] as const,
    categories: () => [...queryKeys.catalog.all, "categories"] as const,
  },
} as const;
