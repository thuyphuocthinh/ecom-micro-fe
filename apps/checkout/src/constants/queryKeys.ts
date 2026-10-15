/**
 * Centralized Query Key Factory for Checkout.
 * Follows the query key factory pattern for consistent caching,
 * type-safety, and predictable invalidation across apps.
 */
export const queryKeys = {
  cart: {
    all: ["cart"] as const,
    summary: () => [...queryKeys.cart.all, "summary"] as const,
  },
  checkout: {
    all: ["checkout"] as const,
    addresses: () => [...queryKeys.checkout.all, "addresses"] as const,
    provinces: () => [...queryKeys.checkout.all, "provinces"] as const,
    wards: (provinceCode: string) =>
      [...queryKeys.checkout.all, "wards", provinceCode] as const,
    order: (id: string) => [...queryKeys.checkout.all, "order", id] as const,
    payments: (orderId: string) =>
      [...queryKeys.checkout.all, "payments", orderId] as const,
  },
} as const;
