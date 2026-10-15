import { describe, expect, it } from "vitest";
import { QueryClient } from "@tanstack/react-query";
import { clearUserData, USER_QUERY_ROOTS } from "./query-cache.ts";

function filledClient() {
  const queryClient = new QueryClient();
  // What belongs to the person
  queryClient.setQueryData(["user", "me"], { id: "u1" });
  queryClient.setQueryData(["user", "addresses"], []);
  queryClient.setQueryData(["cart", "summary"], { lineCount: 2 });
  queryClient.setQueryData(["orders", "list", {}], []);
  queryClient.setQueryData(["orders", "detail", "o1"], {});
  queryClient.setQueryData(["checkout", "order", "o1"], {});
  // What is the same for everybody
  queryClient.setQueryData(["catalog", "categories"], [{ id: "c1" }]);
  queryClient.setQueryData(["catalog", "bestsellers", 8], []);
  queryClient.setQueryData(["products", "list", {}], []);
  queryClient.setQueryData(["categories", "all"], []);
  queryClient.setQueryData(["locations", "provinces"], []);
  return queryClient;
}

describe("clearUserData (AC-5)", () => {
  it("removes what belongs to the person", () => {
    const queryClient = filledClient();

    clearUserData(queryClient);

    for (const key of [
      ["user", "me"],
      ["user", "addresses"],
      ["cart", "summary"],
      ["orders", "list", {}],
      ["orders", "detail", "o1"],
      ["checkout", "order", "o1"],
    ]) {
      expect(queryClient.getQueryData(key)).toBeUndefined();
    }
  });

  it("keeps the public data cached, so public pages do not reload from scratch", () => {
    const queryClient = filledClient();

    clearUserData(queryClient);

    expect(queryClient.getQueryData(["catalog", "categories"])).toEqual([
      { id: "c1" },
    ]);
    expect(queryClient.getQueryData(["catalog", "bestsellers", 8])).toEqual([]);
    expect(queryClient.getQueryData(["products", "list", {}])).toEqual([]);
    expect(queryClient.getQueryData(["categories", "all"])).toEqual([]);
    expect(queryClient.getQueryData(["locations", "provinces"])).toEqual([]);
  });

  it("removes only these four roots, so a new root is public until it is added on purpose", () => {
    expect([...USER_QUERY_ROOTS]).toEqual([
      "user",
      "cart",
      "orders",
      "checkout",
    ]);
  });

  it("does nothing on an empty cache, and can run twice", () => {
    const queryClient = new QueryClient();

    expect(() => {
      clearUserData(queryClient);
      clearUserData(queryClient);
    }).not.toThrow();
  });

  it("scales: a thousand queries of the person go in one call", () => {
    const queryClient = new QueryClient();
    for (let i = 0; i < 1000; i++)
      queryClient.setQueryData(["orders", "detail", `o${i}`], {});
    queryClient.setQueryData(["products", "list"], []);

    clearUserData(queryClient);

    expect(
      queryClient
        .getQueryCache()
        .getAll()
        .map((query) => query.queryKey[0]),
    ).toEqual(["products"]);
  });
});
