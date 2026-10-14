import { describe, expect, it } from "vitest";
import { ApiError } from "./errors";
import { failure, setup, success } from "./test-helpers";

describe("successful answers (AC-1)", () => {
  it("returns data and meta without the wrapper", async () => {
    const { api } = setup(() =>
      success([{ id: "o1" }], { hasMore: true, nextCursor: "abc" }),
    );

    const result = await api.get("/orders");

    expect(result.data).toEqual([{ id: "o1" }]);
    expect(result.meta).toEqual({ hasMore: true, nextCursor: "abc" });
    expect(result.replayed).toBe(false);
  });

  it("leaves meta undefined when the answer has none", async () => {
    const { api } = setup(() => success({ id: "o1" }));

    const result = await api.get("/orders/{id}", { params: { id: "o1" } });

    expect(result.data).toEqual({ id: "o1" });
    expect(result.meta).toBeUndefined();
  });
});

describe("requests", () => {
  it("fills the path, encodes it, and joins a list with commas in the query", async () => {
    const { api, calls } = setup(() => success([]));

    await api.get("/orders", {
      query: { status: ["PENDING", "CONFIRMED"], limit: 10, q: undefined },
    });
    await api.get("/orders/{id}", { params: { id: "a b/c" } });

    expect(calls[0].url).toBe(
      "/api/v1/orders?status=PENDING%2CCONFIRMED&limit=10",
    );
    expect(calls[1].url).toBe("/api/v1/orders/a%20b%2Fc");
  });

  it("sends a JSON body with its content type, and none for a GET", async () => {
    const { api, calls } = setup(() => success({}));

    await api.post("/cart/items", { body: { skuId: "s1", quantity: 2 } });
    await api.get("/cart");

    expect(calls[0].method).toBe("POST");
    expect(calls[0].body).toEqual({ skuId: "s1", quantity: 2 });
    expect(calls[0].headers["Content-Type"]).toBe("application/json");
    expect(calls[1].headers["Content-Type"]).toBeUndefined();
  });

  it("sends FormData without JSON stringifying and omits Content-Type header so the browser sets boundary", async () => {
    const { api, calls } = setup(() => success({}));
    const formData = new FormData();
    formData.append("file", "fake-content");

    await api.put("/users/me/avatar", { body: formData });

    expect(calls[0].method).toBe("PUT");
    expect(calls[0].body).toBe(formData);
    expect(calls[0].headers["Content-Type"]).toBeUndefined();
  });
});

describe("the login token (AC-2)", () => {
  it("sends Authorization: Bearer with the access token", async () => {
    const { api, calls, session } = setup(() => success([]));
    session.set({ accessToken: "T", refreshToken: "R" });

    await api.get("/orders");

    expect(calls[0].headers.Authorization).toBe("Bearer T");
  });

  it("sends no Authorization header when nobody is logged in", async () => {
    const { api, calls } = setup(() => success([]));

    await api.get("/orders");

    expect(calls[0].headers.Authorization).toBeUndefined();
  });
});

describe("errors from the backend (AC-3)", () => {
  it("throws an ApiError with every field the backend sent", async () => {
    const { api } = setup(() =>
      failure(409, "ORD-001", "Not enough stock", { errors: { skuId: "s1" } }),
    );

    const error = await api
      .post("/orders", {
        body: { addressId: "a", paymentMethod: "COD" },
        idempotencyKey: "k-12345678",
      })
      .catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 409,
      code: "ORD-001",
      message: "Not enough stock",
      errors: { skuId: "s1" },
      traceId: "trace-1",
    });
  });

  it("falls back to HTTP_<status> when the answer has no code", async () => {
    const { api } = setup(
      () => new Response(JSON.stringify({ message: "nope" }), { status: 502 }),
    );

    const error = await api.get("/cart").catch((e) => e);

    expect(error).toMatchObject({
      status: 502,
      code: "HTTP_502",
      message: "nope",
    });
  });
});

describe("answers that are not usable (AC-4)", () => {
  it("turns a lost connection into NETWORK, not a raw fetch error", async () => {
    const { api } = setup(() => new TypeError("Failed to fetch"));

    const error = await api.get("/cart").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 0, code: "NETWORK" });
  });

  it("turns an HTML error page into BAD_RESPONSE, not a SyntaxError", async () => {
    const { api } = setup(
      () => new Response("<html>Bad gateway</html>", { status: 502 }),
    );

    const error = await api.get("/cart").catch((e) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 502, code: "BAD_RESPONSE" });
  });

  it("lets a cancelled call stay a cancellation", async () => {
    const abort = new DOMException("aborted", "AbortError");
    const { api } = setup(() => abort);

    const error = await api.get("/cart").catch((e) => e);

    expect(error).toBe(abort);
  });
});
