import { StrictMode, type ReactNode } from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
  type MockInstance,
} from "vitest";
import { act, renderHook } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ApiError, api } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { FALLBACK_POLL_MS } from "../utils/stream-retry.ts";
import { useOrderStatusStream } from "./useOrderStatusStream.ts";

interface OpenStream {
  path: string;
  params?: Record<string, string | number>;
  signal: AbortSignal;
  onMessage: (event: string, data: unknown) => void;
  /** The server closes the stream. */
  end: () => void;
  /** The stream fails. */
  fail: (error: unknown) => void;
}

let opened: OpenStream[] = [];
let queryClient: QueryClient;
let invalidate: MockInstance<QueryClient["invalidateQueries"]>;

const networkError = () =>
  new ApiError({ status: 0, code: "NETWORK", message: "x" });
const httpError = (status: number) =>
  new ApiError({ status, code: `HTTP_${status}`, message: "x" });

const status = (value: string, orderId = "o1") => ({ orderId, status: value });

function wrapper({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function render(orderId: string | undefined, enabled: boolean) {
  return renderHook(({ id, on }) => useOrderStatusStream(id, on), {
    wrapper,
    initialProps: { id: orderId, on: enabled },
  });
}

/** Lets the fake time pass, including the promises that wait on it. */
const pass = (ms: number) => act(() => vi.advanceTimersByTimeAsync(ms));

const keysInvalidated = () =>
  invalidate.mock.calls.map(
    ([filters]) => (filters as { queryKey: unknown[] }).queryKey,
  );

describe("useOrderStatusStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    opened = [];
    queryClient = new QueryClient();
    invalidate = vi.spyOn(queryClient, "invalidateQueries");
    vi.spyOn(api, "stream").mockImplementation(
      (path, options) =>
        new Promise<void>((resolve, reject) => {
          const stream: OpenStream = {
            path,
            params: options.params,
            signal: options.signal as AbortSignal,
            onMessage: options.onMessage,
            end: resolve,
            fail: reject,
          };
          opened.push(stream);
          options.signal?.addEventListener("abort", () => resolve());
        }),
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("opening and closing (AC-5)", () => {
    it("opens one stream for the order when it is enabled", () => {
      render("o1", true);

      expect(opened).toHaveLength(1);
      expect(opened[0].path).toBe("/orders/{id}/events");
      expect(opened[0].params).toEqual({ id: "o1" });
    });

    it("opens nothing without an order, or when it is not enabled", () => {
      render(undefined, true);
      render("o1", false);

      expect(opened).toHaveLength(0);
    });

    it("closes the stream when the page goes away", () => {
      const { unmount } = render("o1", true);

      unmount();

      expect(opened[0].signal.aborted).toBe(true);
    });

    it("closes the stream when it is no longer enabled, and opens again when enabled again", () => {
      const view = render("o1", true);

      view.rerender({ id: "o1", on: false });
      expect(opened[0].signal.aborted).toBe(true);
      expect(opened).toHaveLength(1);

      view.rerender({ id: "o1", on: true });
      expect(opened).toHaveLength(2);
      expect(opened[1].signal.aborted).toBe(false);
    });

    it("moves to the new order when the order changes", () => {
      const view = render("o1", true);

      view.rerender({ id: "o2", on: true });

      expect(opened[0].signal.aborted).toBe(true);
      expect(opened[1].params).toEqual({ id: "o2" });
    });

    it("leaves only one stream open when React draws the page twice (StrictMode)", () => {
      renderHook(() => useOrderStatusStream("o1", true), {
        wrapper: ({ children }) => (
          <StrictMode>
            <QueryClientProvider client={queryClient}>
              {children}
            </QueryClientProvider>
          </StrictMode>
        ),
      });

      const stillOpen = opened.filter((stream) => !stream.signal.aborted);
      expect(stillOpen).toHaveLength(1);
    });

    it("does not open again after it was closed", async () => {
      const { unmount } = render("o1", true);
      unmount();

      await pass(60_000);

      expect(opened).toHaveLength(1);
    });
  });

  describe("messages (AC-6)", () => {
    it("reads the order and its payments again, once each, for every status message", () => {
      render("o1", true);

      act(() => opened[0].onMessage("status", status("PENDING")));

      expect(keysInvalidated()).toEqual([
        queryKeys.checkout.order("o1"),
        queryKeys.checkout.payments("o1"),
      ]);

      act(() => opened[0].onMessage("status", status("PAYMENT_PROCESSING")));

      expect(invalidate).toHaveBeenCalledTimes(4);
    });

    it("does nothing for a ping", () => {
      render("o1", true);

      act(() => opened[0].onMessage("ping", {}));

      expect(invalidate).not.toHaveBeenCalled();
    });

    it.each([
      ["data that is not an object", "status", "text"],
      ["no data", "status", null],
      ["no status", "status", { orderId: "o1" }],
      ["a status that is not text", "status", { orderId: "o1", status: 7 }],
      ["another order", "status", { orderId: "o2", status: "CONFIRMED" }],
      [
        "another kind of message",
        "other",
        { orderId: "o1", status: "CONFIRMED" },
      ],
    ])("ignores a message with %s", (_name, event, data) => {
      const { result } = render("o1", true);

      act(() => opened[0].onMessage(event, data));

      expect(invalidate).not.toHaveBeenCalled();
      expect(result.current.live).toBe(false);
    });

    it("says it is live from the first status message until the stream ends", async () => {
      const { result } = render("o1", true);
      expect(result.current.live).toBe(false);

      act(() => opened[0].onMessage("status", status("PENDING")));
      expect(result.current.live).toBe(true);

      await act(async () => opened[0].end());
      expect(result.current.live).toBe(false);
    });
  });

  describe("opening again after a drop (AC-7)", () => {
    it("opens again after 1 second when the server closes the stream", async () => {
      render("o1", true);

      await act(async () => opened[0].end());
      await pass(999);
      expect(opened).toHaveLength(1);

      await pass(1);
      expect(opened).toHaveLength(2);
    });

    it("waits 1, 2, 4, 8, then 15 seconds between failures", async () => {
      render("o1", true);
      const waits: number[] = [];

      for (let attempt = 0; attempt < 6; attempt += 1) {
        const before = opened.length;
        await act(async () => opened[before - 1].fail(networkError()));
        let waited = 0;
        while (opened.length === before && waited < 20_000) {
          await pass(500);
          waited += 500;
        }
        waits.push(waited);
      }

      expect(waits).toEqual([1000, 2000, 4000, 8000, 15000, 15000]);
    });

    it("starts again from 1 second after a message arrived", async () => {
      render("o1", true);
      await act(async () => opened[0].fail(networkError()));
      await pass(1000);
      await act(async () => opened[1].fail(networkError()));
      await pass(2000);
      expect(opened).toHaveLength(3);

      act(() => opened[2].onMessage("status", status("PENDING")));
      await act(async () => opened[2].end());
      await pass(999);
      expect(opened).toHaveLength(3);
      await pass(1);

      expect(opened).toHaveLength(4);
    });

    it.each([500, 503, 429, 408])("opens again after a %i", async (code) => {
      render("o1", true);

      await act(async () => opened[0].fail(httpError(code)));
      await pass(1000);

      expect(opened).toHaveLength(2);
    });

    it.each([401, 403, 404])("does not open again after a %i", async (code) => {
      render("o1", true);

      await act(async () => opened[0].fail(httpError(code)));
      await pass(60_000);

      expect(opened).toHaveLength(1);
    });
  });

  describe("no polling while it works, a slow one when it does not (AC-8)", () => {
    it("asks for nothing at all during five minutes while the stream is open", async () => {
      render("o1", true);
      act(() => opened[0].onMessage("status", status("PAYMENT_PROCESSING")));
      invalidate.mockClear();

      await pass(5 * 60_000);

      expect(invalidate).not.toHaveBeenCalled();
      expect(opened).toHaveLength(1);
    });

    it("asks for the order, and only the order, every 30 seconds while the stream is down", async () => {
      render("o1", true);
      await act(async () => opened[0].fail(httpError(404)));
      invalidate.mockClear();

      await pass(FALLBACK_POLL_MS - 1);
      expect(invalidate).not.toHaveBeenCalled();
      await pass(1);
      expect(keysInvalidated()).toEqual([queryKeys.checkout.order("o1")]);

      await pass(FALLBACK_POLL_MS);
      expect(invalidate).toHaveBeenCalledTimes(2);
    });

    it("also asks every 30 seconds while the stream keeps dropping", async () => {
      render("o1", true);
      await act(async () => opened[0].fail(networkError()));
      invalidate.mockClear();

      // The attempts at 1, 3, 7, 15 and 30 seconds all fail again
      for (let i = 0; i < 5; i += 1) {
        await pass(nextWait(i));
        await act(async () => opened.at(-1)!.fail(networkError()));
      }
      await pass(FALLBACK_POLL_MS);

      expect(keysInvalidated()).toContainEqual(queryKeys.checkout.order("o1"));
      expect(keysInvalidated()).not.toContainEqual(
        queryKeys.checkout.payments("o1"),
      );
    });

    it("stops asking now and then as soon as a message arrives", async () => {
      render("o1", true);
      await act(async () => opened[0].end());
      await pass(1000);
      expect(opened).toHaveLength(2);

      act(() => opened[1].onMessage("status", status("PENDING")));
      invalidate.mockClear();
      await pass(FALLBACK_POLL_MS * 4);

      expect(invalidate).not.toHaveBeenCalled();
    });

    it("leaves no timer behind when the page goes away", async () => {
      const { unmount } = render("o1", true);
      await act(async () => opened[0].end());
      await pass(1000);

      unmount();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});

/** The waits of the first failures: 1, 2, 4, 8 seconds. */
function nextWait(index: number): number {
  return [1000, 2000, 4000, 8000, 15000][index];
}
