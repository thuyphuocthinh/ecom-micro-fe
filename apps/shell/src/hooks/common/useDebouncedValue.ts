import { useEffect, useState } from "react";

/** How long to wait after the last keystroke before acting on what was typed. */
export const DEFAULT_DEBOUNCE_MS = 300;

/**
 * The value, but only after it stopped changing for `delayMs`. While someone types, `value` changes on
 * every key and the result stays the old one; the last value comes out once, after the pause.
 */
export function useDebouncedValue<T>(
  value: T,
  delayMs: number = DEFAULT_DEBOUNCE_MS,
): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
