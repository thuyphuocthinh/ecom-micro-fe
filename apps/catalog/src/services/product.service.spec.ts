import { afterEach, describe, expect, it, vi } from "vitest";
import { productService } from "./product.service.ts";

/**
 * These go through the real `@ecom/api` client and only fake the network, with answers shaped as the
 * backend sends them: the list in `data`, the paging in `meta`, side by side. A test that mocks
 * `api.get` itself would agree with whatever shape the service assumes, and miss a service that reads
 * the wrong place (it once read `res.data.data` and showed an empty list for a full answer).
 */
const answer = (body: unknown) =>
  vi.stubGlobal(
    "fetch",
    vi.fn(
      async () =>
        new Response(
          JSON.stringify({
            statusCode: 200,
            message: "Success",
            ...(body as object),
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          },
        ),
    ),
  );

const product = (id: string) => ({
  id,
  categoryId: "cat-1",
  name: `Product ${id}`,
  status: "PUBLISHED",
  skus: [],
});

afterEach(() => vi.unstubAllGlobals());

describe("productService.getProducts", () => {
  it("returns the products and the cursor of a cursor list", async () => {
    answer({
      data: [product("p1"), product("p2")],
      meta: { hasMore: true, nextCursor: "p2" },
    });

    const result = await productService.getProducts({
      sort: "newest",
      limit: 2,
    });

    expect(result.data.map((p) => p.id)).toEqual(["p1", "p2"]);
    expect(result.meta).toEqual({ hasMore: true, nextCursor: "p2" });
  });

  it("returns the products and the page numbers of a numbered list", async () => {
    answer({
      data: [product("p1")],
      meta: {
        hasMore: true,
        page: 2,
        limit: 12,
        total: 500,
        totalCapped: false,
      },
    });

    const result = await productService.getProducts({
      sort: "price_asc",
      page: 2,
    });

    expect(result.data).toHaveLength(1);
    expect(result.meta).toMatchObject({ page: 2, total: 500, hasMore: true });
  });

  it("gives an empty list and empty paging when the answer has none", async () => {
    answer({ data: [] });

    expect(await productService.getProducts()).toEqual({ data: [], meta: {} });
  });
});
