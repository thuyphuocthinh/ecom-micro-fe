/** Used when the browser has no requestIdleCallback (Safari): run after this many milliseconds. */
export const IDLE_FALLBACK_MS = 2000;

/**
 * Runs `callback` when the browser has nothing better to do (after the page is drawn and the customer is
 * not busy), so background work never competes with what the customer is waiting for. Returns a function
 * that cancels it.
 */
export function whenIdle(
  callback: () => void,
  timeoutMs: number = IDLE_FALLBACK_MS,
): () => void {
  if (
    typeof window !== "undefined" &&
    typeof window.requestIdleCallback === "function"
  ) {
    const handle = window.requestIdleCallback(callback, { timeout: timeoutMs });
    return () => window.cancelIdleCallback(handle);
  }
  const timer = setTimeout(callback, timeoutMs);
  return () => clearTimeout(timer);
}
