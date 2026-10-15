import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";

const prefetchAll = vi.fn(async () => undefined);
vi.mock("@/libs/remote-loaders.ts", () => ({
  remotePrefetcher: { prefetchAll: () => prefetchAll(), prefetch: vi.fn() },
}));

let idleCallback: (() => void) | null = null;
const cancel = vi.fn();
vi.mock("@/utils/idle.ts", () => ({
  whenIdle: (callback: () => void) => {
    idleCallback = callback;
    return cancel;
  },
}));

import { usePrefetchRemotes } from "./usePrefetchRemotes.ts";

function Probe() {
  usePrefetchRemotes();
  return null;
}

beforeEach(() => {
  vi.clearAllMocks();
  idleCallback = null;
});

describe("usePrefetchRemotes (AC-12)", () => {
  it("loads nothing while the page is still being drawn, only when the browser is idle", () => {
    render(<Probe />);

    expect(prefetchAll).not.toHaveBeenCalled();

    idleCallback?.();

    expect(prefetchAll).toHaveBeenCalledTimes(1);
  });

  it("asks once when the page mounts, and not again when it renders again", () => {
    const { rerender } = render(<Probe />);
    rerender(<Probe />);
    rerender(<Probe />);

    idleCallback?.();

    expect(prefetchAll).toHaveBeenCalledTimes(1);
  });

  it("cancels the wait when the page goes away before the browser was idle", () => {
    const { unmount } = render(<Probe />);

    unmount();

    expect(cancel).toHaveBeenCalledTimes(1);
  });
});
