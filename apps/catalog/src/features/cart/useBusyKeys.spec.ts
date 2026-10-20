import { describe, it, expect, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useBusyKeys } from "./useBusyKeys.ts";

/** An action that ends when the test says so. */
function slowAction() {
  let finish!: () => void;
  const action = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  return { action, finish: () => finish() };
}

describe("useBusyKeys", () => {
  it("is busy for a key while its action runs, and not after", async () => {
    const { result } = renderHook(() => useBusyKeys());
    const { action, finish } = slowAction();

    let running!: Promise<void>;
    act(() => {
      running = result.current.run("a", action);
    });
    expect(result.current.isBusy("a")).toBe(true);
    expect(result.current.isBusy("b")).toBe(false);

    await act(async () => {
      finish();
      await running;
    });
    expect(result.current.isBusy("a")).toBe(false);
  });

  it("does not run a second action for a key that is busy (two presses at once)", async () => {
    const { result } = renderHook(() => useBusyKeys());
    const { action, finish } = slowAction();
    const second = vi.fn(async () => {});

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.run("a", action);
      await result.current.run("a", second);
    });

    expect(action).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();

    await act(async () => {
      finish();
      await first;
    });
    // free again: a new press runs
    await act(async () => {
      await result.current.run("a", second);
    });
    expect(second).toHaveBeenCalledTimes(1);
  });

  it("lets different keys run together", async () => {
    const { result } = renderHook(() => useBusyKeys());
    const one = slowAction();
    const two = slowAction();

    let runs: Promise<void>[] = [];
    act(() => {
      runs = [
        result.current.run("a", one.action),
        result.current.run("b", two.action),
      ];
    });

    expect(one.action).toHaveBeenCalledTimes(1);
    expect(two.action).toHaveBeenCalledTimes(1);
    expect(result.current.isBusy("a")).toBe(true);
    expect(result.current.isBusy("b")).toBe(true);

    await act(async () => {
      one.finish();
      two.finish();
      await Promise.all(runs);
    });
    expect(result.current.isBusy("a")).toBe(false);
    expect(result.current.isBusy("b")).toBe(false);
  });

  it("is free again when the action fails", async () => {
    const { result } = renderHook(() => useBusyKeys());

    await act(async () => {
      await expect(
        result.current.run("a", async () => {
          throw new Error("boom");
        }),
      ).rejects.toThrow("boom");
    });

    expect(result.current.isBusy("a")).toBe(false);
  });
});
