import { describe, it, expect } from "vitest";
import { getPaymentState, paymentIdempotencyKey } from "./payment";

describe("payment state utils", () => {
  it("determines success when order is confirmed or payment is succeeded", () => {
    expect(getPaymentState("CONFIRMED", "PENDING").isSuccess).toBe(true);
    expect(getPaymentState("PENDING", "SUCCEEDED").isSuccess).toBe(true);
  });

  it("determines failed when payment status is FAILED", () => {
    const state = getPaymentState("PENDING", "FAILED");
    expect(state.isFailed).toBe(true);
    expect(state.isSuccess).toBe(false);
  });

  it("determines expired when order or payment is expired", () => {
    expect(getPaymentState("EXPIRED", undefined).isExpired).toBe(true);
    expect(getPaymentState("PENDING", "EXPIRED").isExpired).toBe(true);
  });

  it("determines waiting when not success, failed, or expired", () => {
    const state = getPaymentState("PENDING", "INITIATED");
    expect(state.isWaiting).toBe(true);
  });
});

describe("paymentIdempotencyKey (AC-1, AC-3)", () => {
  const ORDER = "a53d2f50-f7be-5576-b3d0-0a29663b1cf9";

  it("is the same for the same order and attempt, however often it is asked", () => {
    expect(paymentIdempotencyKey(ORDER, 1)).toBe(
      paymentIdempotencyKey(ORDER, 1),
    );
  });

  it("differs for another attempt and for another order", () => {
    expect(paymentIdempotencyKey(ORDER, 2)).not.toBe(
      paymentIdempotencyKey(ORDER, 1),
    );
    expect(paymentIdempotencyKey("other-order-id", 1)).not.toBe(
      paymentIdempotencyKey(ORDER, 1),
    );
  });

  it("follows the rule of the backend: 8 to 100 of A-Z a-z 0-9 _ -", () => {
    for (const attempt of [1, 2, 3, 99]) {
      expect(paymentIdempotencyKey(ORDER, attempt)).toMatch(
        /^[A-Za-z0-9_-]{8,100}$/,
      );
    }
  });
});
