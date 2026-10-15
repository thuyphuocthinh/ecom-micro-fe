export type RemoteLoader = () => Promise<unknown>;

/** The pages the Shell borrows from the other apps (Module Federation remotes). */
export const REMOTE_KEYS = {
  search: "catalog/SearchPage",
  product: "catalog/ProductDetailPage",
  cart: "checkout/CartPage",
} as const;

export type RemoteKey = (typeof REMOTE_KEYS)[keyof typeof REMOTE_KEYS];

/** Which remote page a path of the store opens, if any: "/search?q=a" opens the search page. */
export function remoteKeyForPath(path: string): RemoteKey | undefined {
  const pathname = path.split(/[?#]/)[0];
  if (pathname === "/search") return REMOTE_KEYS.search;
  if (pathname.startsWith("/products/")) return REMOTE_KEYS.product;
  if (pathname === "/cart") return REMOTE_KEYS.cart;
  return undefined;
}

/**
 * Loads the code of a remote page ahead of time, so opening it later finds the code already there
 * instead of fetching the remote's entry file first, then the page, then its data one after the other.
 *
 * - Each remote is loaded **at most once**, however many times it is asked for.
 * - A failure (the other app is not running) is swallowed: it is only an optimisation. The failed one is
 *   forgotten, so it can be tried again; opening the page for real loads it on its own anyway.
 */
export function createRemotePrefetcher<K extends string>(
  loaders: Record<K, RemoteLoader>,
) {
  const started = new Map<K, Promise<void>>();

  function prefetch(key: K): Promise<void> {
    const existing = started.get(key);
    if (existing) return existing;

    const promise = new Promise<unknown>((resolve) => resolve(loaders[key]()))
      .then(() => undefined)
      .catch(() => {
        started.delete(key);
      });
    started.set(key, promise);
    return promise;
  }

  function prefetchAll(): Promise<void> {
    return Promise.all((Object.keys(loaders) as K[]).map(prefetch)).then(
      () => undefined,
    );
  }

  return { prefetch, prefetchAll };
}
