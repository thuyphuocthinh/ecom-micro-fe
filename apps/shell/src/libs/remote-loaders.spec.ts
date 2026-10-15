import { beforeEach, describe, expect, it, vi } from "vitest";

// Each factory runs when its module is really loaded: counting the runs counts the downloads
const loaded = vi.hoisted(() => ({
  search: vi.fn(),
  product: vi.fn(),
  cart: vi.fn(),
}));

/** A new prefetcher with nothing loaded yet, and mocks that count each real load of a remote page. */
async function freshLoaders() {
  vi.resetModules();
  vi.doMock("catalog/SearchPage", () => {
    loaded.search();
    return {};
  });
  vi.doMock("catalog/ProductDetailPage", () => {
    loaded.product();
    return {};
  });
  vi.doMock("checkout/CartPage", () => {
    loaded.cart();
    return {};
  });
  return import("./remote-loaders.ts");
}

const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("prefetchForPath (AC-12, AC-13)", () => {
  it("loads the search page for /search, once, however often it is asked", async () => {
    const { prefetchForPath } = await freshLoaders();

    prefetchForPath("/search");
    prefetchForPath("/search?q=iphone");
    prefetchForPath("/search?category=seed_cat_phones");
    await settle();

    expect(loaded.search).toHaveBeenCalledTimes(1);
    expect(loaded.product).not.toHaveBeenCalled();
    expect(loaded.cart).not.toHaveBeenCalled();
  });

  it("loads the product page for a product, and the cart page for the cart", async () => {
    const { prefetchForPath } = await freshLoaders();

    prefetchForPath("/products/seed_prod_iphone15");
    prefetchForPath("/products/another");
    prefetchForPath("/cart");
    await settle();

    expect(loaded.product).toHaveBeenCalledTimes(1);
    expect(loaded.cart).toHaveBeenCalledTimes(1);
    expect(loaded.search).not.toHaveBeenCalled();
  });

  it("loads nothing for the pages of the Shell itself", async () => {
    const { prefetchForPath } = await freshLoaders();

    for (const path of ["/", "/login", "/account/orders", "/checkout"]) {
      prefetchForPath(path);
    }
    await settle();

    expect(loaded.search).not.toHaveBeenCalled();
    expect(loaded.product).not.toHaveBeenCalled();
    expect(loaded.cart).not.toHaveBeenCalled();
  });
});

describe("prefetchOnIntent (AC-13)", () => {
  it("the mouse arriving loads the page, and so does the keyboard focus, once in all", async () => {
    const { prefetchOnIntent } = await freshLoaders();
    const handlers = prefetchOnIntent("/cart");

    handlers.onMouseEnter();
    handlers.onFocus();
    handlers.onMouseEnter();
    await settle();

    expect(loaded.cart).toHaveBeenCalledTimes(1);
  });

  it("does nothing until the customer shows intent", async () => {
    const { prefetchOnIntent } = await freshLoaders();

    prefetchOnIntent("/search");
    await settle();

    expect(loaded.search).not.toHaveBeenCalled();
  });
});

describe("remotePrefetcher.prefetchAll (AC-12)", () => {
  it("loads the three remote pages once, and a second call loads nothing more", async () => {
    const { remotePrefetcher } = await freshLoaders();

    await remotePrefetcher.prefetchAll();
    await remotePrefetcher.prefetchAll();

    expect(loaded.search).toHaveBeenCalledTimes(1);
    expect(loaded.product).toHaveBeenCalledTimes(1);
    expect(loaded.cart).toHaveBeenCalledTimes(1);
  });

  it("what was loaded by hovering is not loaded again at idle time", async () => {
    const { remotePrefetcher, prefetchForPath } = await freshLoaders();

    prefetchForPath("/cart");
    await settle();
    await remotePrefetcher.prefetchAll();

    expect(loaded.cart).toHaveBeenCalledTimes(1);
  });
});
