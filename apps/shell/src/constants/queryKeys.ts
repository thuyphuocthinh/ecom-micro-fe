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
} as const;
