import type { QueryClient } from "@tanstack/react-query";

/**
 * The first part of the query key of everything that belongs to the signed-in person. Public data
 * (products, categories, places) is not here: it is the same for everybody and stays cached.
 */
export const USER_QUERY_ROOTS: readonly string[] = [
  "user",
  "cart",
  "orders",
  "checkout",
];

/** Forgets what belongs to the person who just left (logout, expired or ended elsewhere), and only that. */
export function clearUserData(queryClient: QueryClient): void {
  queryClient.removeQueries({
    predicate: (query) => USER_QUERY_ROOTS.includes(String(query.queryKey[0])),
  });
}
