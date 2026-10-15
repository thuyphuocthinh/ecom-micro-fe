import {
  createRemotePrefetcher,
  REMOTE_KEYS,
  remoteKeyForPath,
} from "@/utils/remote-prefetch.ts";

/** The real loaders: the same `import()` the router uses, so the code is shared once it is loaded. */
export const remotePrefetcher = createRemotePrefetcher({
  [REMOTE_KEYS.search]: () => import("catalog/SearchPage"),
  [REMOTE_KEYS.product]: () => import("catalog/ProductDetailPage"),
  [REMOTE_KEYS.cart]: () => import("checkout/CartPage"),
});

/** Loads ahead the remote page that `path` opens (nothing for a page of the Shell itself). */
export function prefetchForPath(path: string): void {
  const key = remoteKeyForPath(path);
  if (key) void remotePrefetcher.prefetch(key);
}

/**
 * For a link or a button that leads to `path`: the mouse arriving, or the keyboard focus, loads the page
 * ahead, so the click finds the code already there (AC-13). Spread it on the element.
 */
export function prefetchOnIntent(path: string) {
  const prefetch = () => prefetchForPath(path);
  return { onMouseEnter: prefetch, onFocus: prefetch };
}
