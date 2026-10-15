import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { DEFAULT_DEBOUNCE_MS, useDebouncedValue } from "./useDebouncedValue.ts";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("useDebouncedValue", () => {
  it("starts with the value it is given", () => {
    const { result } = renderHook(() => useDebouncedValue("abc"));

    expect(result.current).toBe("abc");
  });

  it("waits for the delay (300 ms by default) before showing a new value", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "ab" });
    act(() => {
      vi.advanceTimersByTime(DEFAULT_DEBOUNCE_MS - 1);
    });
    expect(result.current).toBe("a");

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("ab");
  });

  it("typing without a pause gives only the last value, once", () => {
    const seen: string[] = [];
    const { result, rerender } = renderHook(
      ({ value }) => {
        const debounced = useDebouncedValue(value, 300);
        if (seen.at(-1) !== debounced) seen.push(debounced);
        return debounced;
      },
      { initialProps: { value: "" } },
    );

    for (const text of [
      "3",
      "3F",
      "3FA",
      "3FA8",
      "3FA85",
      "3FA85F",
      "3FA85F6",
      "3FA85F64",
    ]) {
      rerender({ value: text });
      act(() => {
        vi.advanceTimersByTime(100); // faster than the pause: the timer keeps starting over
      });
    }
    expect(result.current).toBe("");

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current).toBe("3FA85F64");
    expect(seen).toEqual(["", "3FA85F64"]); // nothing in between
  });

  it("a delay of your own", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebouncedValue(value, 1000),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    act(() => {
      vi.advanceTimersByTime(999);
    });
    expect(result.current).toBe("a");
    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current).toBe("b");
  });

  it("leaves no timer behind when it is removed, and does not change anything afterwards", () => {
    const { rerender, unmount } = renderHook(
      ({ value }) => useDebouncedValue(value),
      { initialProps: { value: "a" } },
    );

    rerender({ value: "b" });
    expect(vi.getTimerCount()).toBe(1);

    unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  it("keeps one timer at a time, however fast the value changes (no pile-up)", () => {
    const { rerender } = renderHook(({ value }) => useDebouncedValue(value), {
      initialProps: { value: 0 },
    });

    for (let i = 1; i <= 100; i++) rerender({ value: i });

    expect(vi.getTimerCount()).toBe(1);
  });
});
