import { describe, expect, it } from "vitest";
import { createIdempotencyKey } from "./idempotency";
import { failure, setup, success } from "./test-helpers";

const order = { addressId: "a1", paymentMethod: "ONLINE" } as const;

describe("Idempotency-Key (AC-8)", () => {
  it("sends the same key on every retry, and does not change it itself", async () => {
    const { api, calls } = setup((_call, index) =>
      index === 0
        ? new TypeError("Failed to fetch")
        : success({ id: "o1" }, undefined, 201),
    );
    const idempotencyKey = createIdempotencyKey();

    await api
      .post("/orders", { body: order, idempotencyKey })
      .catch(() => undefined); // the network dropped
    await api.post("/orders", { body: order, idempotencyKey }); // the customer pressed again
    await api.post("/orders", { body: order, idempotencyKey });

    expect(calls.map((call) => call.headers["Idempotency-Key"])).toEqual([
      idempotencyKey,
      idempotencyKey,
      idempotencyKey,
    ]);
  });

  it("sends no key when the page gives none", async () => {
    const { api, calls } = setup(() => success([]));

    await api.get("/orders");

    expect(calls[0].headers["Idempotency-Key"]).toBeUndefined();
  });

  it("makes keys the backend accepts, and a different one each time", () => {
    const keys = Array.from({ length: 50 }, () => createIdempotencyKey());

    for (const key of keys) expect(key).toMatch(/^[A-Za-z0-9_-]{8,100}$/);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("a replayed answer (AC-9)", () => {
  it("is flagged when the backend says so", async () => {
    const { api } = setup(() =>
      success({ id: "o1" }, undefined, 200, { "Idempotency-Replayed": "true" }),
    );

    const result = await api.post("/orders", {
      body: order,
      idempotencyKey: "attempt-0001",
    });

    expect(result.replayed).toBe(true);
  });

  it("is not flagged for a first answer", async () => {
    const { api } = setup(() => success({ id: "o1" }, undefined, 201));

    const result = await api.post("/orders", {
      body: order,
      idempotencyKey: "attempt-0001",
    });

    expect(result.replayed).toBe(false);
  });
});

describe("rate limits (AC-10)", () => {
  it("exposes how long to wait and does not send the request again", async () => {
    const { api, calls } = setup(() => {
      const body = {
        statusCode: 429,
        code: "AUTH-006",
        message: "Too many requests",
      };
      return new Response(JSON.stringify(body), {
        status: 429,
        headers: { "Retry-After": "30" },
      });
    });

    const error = await api
      .post("/auth/login", { body: { email: "a@b.c", password: "x" } })
      .catch((e) => e);

    expect(error).toMatchObject({
      status: 429,
      code: "AUTH-006",
      retryAfterSeconds: 30,
    });
    expect(calls).toHaveLength(1);
  });

  it("leaves retryAfterSeconds empty when there is no header", async () => {
    const { api } = setup(() => failure(429, "AUTH-006"));

    const error = await api.get("/cart").catch((e) => e);

    expect(error.retryAfterSeconds).toBeUndefined();
  });
});
