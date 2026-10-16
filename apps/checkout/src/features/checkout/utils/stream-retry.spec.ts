import { afterEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "@ecom/api";
import {
  RETRY_DELAYS_MS,
  abortableDelay,
  isRetryable,
  nextRetryDelay,
} from "./stream-retry.ts";

const apiError = (status: number) =>
  new ApiError({ status, code: `HTTP_${status}`, message: "x" });

describe("nextRetryDelay (AC-7)", () => {
  it("goes 1, 2, 4, 8, then 15 seconds, and stays at 15", () => {
    expect([0, 1, 2, 3, 4, 5, 6, 50].map(nextRetryDelay)).toEqual([
      1000, 2000, 4000, 8000, 15000, 15000, 15000, 15000,
    ]);
    expect(RETRY_DELAYS_MS.at(-1)).toBe(15000);
  });

  it("does not go below the first delay for a bad count", () => {
    expect(nextRetryDelay(-3)).toBe(1000);
  });
});

describe("isRetryable (AC-7)", () => {
  it.each([0, 500, 502, 503, 408, 429])("tries again after %i", (status) => {
    expect(isRetryable(apiError(status))).toBe(true);
  });

  it.each([400, 401, 403, 404, 409, 422])(
    "does not try again after %i",
    (status) => {
      expect(isRetryable(apiError(status))).toBe(false);
    },
  );

  it("tries again after an error that is not an ApiError (a stream that broke)", () => {
    expect(isRetryable(new TypeError("network error"))).toBe(true);
  });
});

describe("abortableDelay", () => {
  afterEach(() => vi.useRealTimers());

  it("waits for the time asked", async () => {
    vi.useFakeTimers();
    const done = vi.fn();
    void abortableDelay(1000, new AbortController().signal).then(done);

    await vi.advanceTimersByTimeAsync(999);
    expect(done).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(done).toHaveBeenCalled();
  });

  it("returns at once when it is aborted, and leaves no timer behind", async () => {
    vi.useFakeTimers();
    const controller = new AbortController();
    const done = vi.fn();
    void abortableDelay(60_000, controller.signal).then(done);

    controller.abort();
    await vi.advanceTimersByTimeAsync(0);

    expect(done).toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("returns at once when it is already aborted", async () => {
    const controller = new AbortController();
    controller.abort();

    await expect(
      abortableDelay(60_000, controller.signal),
    ).resolves.toBeUndefined();
  });
});
