// AC-12: calls are checked while compiling. This file is never run: `pnpm typecheck` must pass, and
// every `@ts-expect-error` must really be an error (an unused one is itself an error).
import { createApiClient } from "./client";
import type { components } from "./generated/schema";

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
    ? true
    : false;
function assertType<_T extends true>() {}

const api = createApiClient();

export async function typeChecks() {
  // The data type comes from the Swagger answer: a list of order summaries, with paging in `meta`
  const orders = await api.get("/orders", {
    query: { limit: 10, status: ["PENDING", "CONFIRMED"] },
  });
  assertType<
    Equal<
      typeof orders.data,
      components["schemas"]["OrderSummaryResponseDto"][]
    >
  >();
  void orders.meta?.nextCursor;

  // Path parameters are required and named after the path
  const order = await api.get("/orders/{id}", { params: { id: "abc" } });
  assertType<
    Equal<typeof order.data, components["schemas"]["OrderResponseDto"]>
  >();

  // Placing an order: the body is checked, the Idempotency-Key is an option, not a parameter
  await api.post("/orders", {
    body: { addressId: "a", paymentMethod: "ONLINE" },
    idempotencyKey: "attempt-0001",
  });

  // A call with nothing to send needs no options
  await api.get("/cart");

  // @ts-expect-error a path that is not in the API
  await api.get("/does-not-exist");

  // @ts-expect-error GET /orders/{id} needs its id
  await api.get("/orders/{id}");

  // @ts-expect-error a path parameter of the wrong name
  await api.get("/orders/{id}", { params: { orderId: "abc" } });

  // @ts-expect-error a field the body requires is missing
  await api.post("/orders", { body: { addressId: "a" } });

  await api.post("/orders", {
    // @ts-expect-error a value the field does not allow
    body: { addressId: "a", paymentMethod: "BITCOIN" },
  });

  // @ts-expect-error a query value of the wrong type
  await api.get("/orders", { query: { limit: "ten" } });

  // @ts-expect-error GET is not a method of /orders/{id}/cancel
  await api.get("/orders/{id}/cancel", { params: { id: "abc" } });
}
