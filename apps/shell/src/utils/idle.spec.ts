import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { IDLE_FALLBACK_MS, whenIdle } from "./idle.ts";

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe("whenIdle (AC-12)", () => {
  it("uses requestIdleCallback when the browser has it, with a time limit", () => {
    const request = vi.fn(() => 7);
    const cancel = vi.fn();
    vi.stubGlobal("requestIdleCallback", request);
    vi.stubGlobal("cancelIdleCallback", cancel);
    const callback = vi.fn();

    const stop = whenIdle(callback, 1500);

    expect(request).toHaveBeenCalledWith(callback, { timeout: 1500 });
    stop();
    expect(cancel).toHaveBeenCalledWith(7);
  });

  it("falls back to a timer of 2 seconds when there is no requestIdleCallback (Safari)", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    whenIdle(callback);

    vi.advanceTimersByTime(IDLE_FALLBACK_MS - 1);
    expect(callback).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("can be cancelled before it runs, on both paths", () => {
    vi.stubGlobal("requestIdleCallback", undefined);
    const callback = vi.fn();

    const stop = whenIdle(callback);
    stop();
    vi.advanceTimersByTime(IDLE_FALLBACK_MS * 2);

    expect(callback).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });
});
