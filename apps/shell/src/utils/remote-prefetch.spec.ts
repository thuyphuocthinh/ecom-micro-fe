import { describe, expect, it, vi } from "vitest";
import {
  createRemotePrefetcher,
  REMOTE_KEYS,
  remoteKeyForPath,
} from "./remote-prefetch.ts";

describe("createRemotePrefetcher (AC-12, AC-13)", () => {
  it("loads each remote at most once, however many times it is asked for", async () => {
    const load = vi.fn(async () => ({}));
    const { prefetch } = createRemotePrefetcher({
      a: load,
      b: vi.fn(async () => ({})),
    });

    await Promise.all([prefetch("a"), prefetch("a"), prefetch("a")]);
    await prefetch("a");

    expect(load).toHaveBeenCalledTimes(1);
  });

  it("prefetchAll starts every remote exactly once, even when called again", async () => {
    const loaders = {
      one: vi.fn(async () => ({})),
      two: vi.fn(async () => ({})),
      three: vi.fn(async () => ({})),
    };
    const { prefetchAll } = createRemotePrefetcher(loaders);

    await prefetchAll();
    await prefetchAll();

    for (const loader of Object.values(loaders)) {
      expect(loader).toHaveBeenCalledTimes(1);
    }
  });

  it("starts all the remotes at the same time, not one after the other", async () => {
    const started: string[] = [];
    const never = () => new Promise<unknown>(() => undefined);
    const { prefetchAll } = createRemotePrefetcher({
      one: () => (started.push("one"), never()),
      two: () => (started.push("two"), never()),
    });

    void prefetchAll();

    expect(started).toEqual(["one", "two"]);
  });

  it("swallows a failure: nothing is thrown, nothing is shown", async () => {
    const { prefetch, prefetchAll } = createRemotePrefetcher({
      broken: async () => {
        throw new Error("the other app is not running");
      },
      fine: async () => ({}),
    });

    await expect(prefetch("broken")).resolves.toBeUndefined();
    await expect(prefetchAll()).resolves.toBeUndefined();
  });

  it("swallows a loader that throws at once (not a promise)", async () => {
    const { prefetch } = createRemotePrefetcher({
      broken: () => {
        throw new Error("sync failure");
      },
    });

    await expect(prefetch("broken")).resolves.toBeUndefined();
  });

  it("forgets a failed remote, so it can be tried again later", async () => {
    let calls = 0;
    const { prefetch } = createRemotePrefetcher({
      flaky: async () => {
        calls += 1;
        if (calls === 1) throw new Error("not yet");
        return {};
      },
    });

    await prefetch("flaky");
    await prefetch("flaky");
    await prefetch("flaky");

    expect(calls).toBe(2); // the failure, then one success; the success is remembered
  });
});

describe("remoteKeyForPath", () => {
  it.each([
    ["/search", REMOTE_KEYS.search],
    ["/search?q=iphone", REMOTE_KEYS.search],
    ["/search?category=seed_cat_phones#top", REMOTE_KEYS.search],
    ["/products/abc-123", REMOTE_KEYS.product],
    ["/cart", REMOTE_KEYS.cart],
  ])("%s opens %s", (path, key) => {
    expect(remoteKeyForPath(path)).toBe(key);
  });

  it.each([
    "/",
    "/login",
    "/account/orders",
    "/products",
    "/checkout",
    "/searching",
  ])("%s is not a remote page of the store", (path) => {
    expect(remoteKeyForPath(path)).toBeUndefined();
  });
});
