import { describe, it, expect } from "vitest";
import { getPaymentState } from "./payment";

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
