import { ApiError } from "@ecom/api";

/** How long to wait before opening the stream again, after the 1st, 2nd, 3rd... failure. The last one repeats. */
export const RETRY_DELAYS_MS = [1000, 2000, 4000, 8000, 15000] as const;

/** While the stream is not working, the order is asked for this often instead. */
export const FALLBACK_POLL_MS = 30_000;

/** The wait before the next try; `attempt` counts from 0. */
export function nextRetryDelay(attempt: number): number {
  const last = RETRY_DELAYS_MS.length - 1;
  return RETRY_DELAYS_MS[Math.min(Math.max(attempt, 0), last)];
}

/**
 * Whether trying again can help: a network failure, a server error, "too many requests" and "request
 * timeout" can pass. Any other answer of the server (not found, not allowed, not signed in) will be
 * the same next time, so the page falls back to asking now and then instead.
 */
export function isRetryable(error: unknown): boolean {
  if (!(error instanceof ApiError)) return true;
  return (
    error.status === 0 ||
    error.status >= 500 ||
    error.status === 408 ||
    error.status === 429
  );
}

/** Waits `ms`, or less when `signal` is aborted (then it returns at once). */
export function abortableDelay(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve) => {
    if (signal.aborted) return resolve();
    const done = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timer = setTimeout(done, ms);
    signal.addEventListener("abort", done);
  });
}
