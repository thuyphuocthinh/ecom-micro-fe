import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCountdown } from "./useCountdown.ts";

describe("useCountdown", () => {
  it("counts down second by second until reaching 0", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCountdown(3));
    expect(result.current.countdown).toBe(3);
    expect(result.current.isRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.countdown).toBe(2);

    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.countdown).toBe(0);
    expect(result.current.isRunning).toBe(false);

    vi.useRealTimers();
  });

  it("can be reset to a new duration", () => {
    vi.useFakeTimers();

    const { result } = renderHook(() => useCountdown(0));
    expect(result.current.countdown).toBe(0);
    expect(result.current.isRunning).toBe(false);

    act(() => {
      result.current.resetCountdown(60);
    });
    expect(result.current.countdown).toBe(60);
    expect(result.current.isRunning).toBe(true);

    vi.useRealTimers();
  });

  it("calculates accurate countdown from targetTimestamp across simulated reloads", () => {
    vi.useFakeTimers();
    const now = Date.now();
    const targetTimestamp = now + 45 * 1000; // 45 seconds in future

    // Simulated first mount
    const { result: firstResult } = renderHook(() =>
      useCountdown({ targetTimestamp }),
    );
    expect(firstResult.current.countdown).toBe(45);

    // 15 seconds pass
    act(() => {
      vi.advanceTimersByTime(15 * 1000);
    });
    expect(firstResult.current.countdown).toBe(30);

    // Simulated page reload (new component instance with the same targetTimestamp)
    const { result: reloadedResult } = renderHook(() =>
      useCountdown({ targetTimestamp }),
    );
    expect(reloadedResult.current.countdown).toBe(30);

    vi.useRealTimers();
  });
});
