import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import { DEFAULT_DEBOUNCE_MS, useDebouncedValue } from "./useDebouncedValue.ts";

/** An empty or blank box means "no filter": it is stored as an empty string, and the parameter is removed. */
const committed = (value: string) => (value.trim() ? value : "");

/**
 * A text box tied to a URL query parameter, for filters that are typed (an order code, a search word).
 *
 * - `input` follows every keystroke, so the box never lags.
 * - The URL is written **once**, `delayMs` after the last keystroke, and it **replaces** the current
 *   history entry: typing "3FA85F64" adds no entry and the Back button still goes back one page.
 * - When the URL changes from somewhere else (a "clear filters" button, the Back button), the box
 *   follows it. A value this hook wrote itself is not taken back, so characters typed while the URL is
 *   being updated are not lost.
 */
export function useDebouncedSearchParam(
  name: string,
  delayMs: number = DEFAULT_DEBOUNCE_MS,
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlValue = searchParams.get(name) ?? "";

  const [input, setInput] = useState(urlValue);
  const lastWritten = useRef(committed(urlValue));
  const debounced = committed(useDebouncedValue(input, delayMs));

  // The URL changed from outside: the box follows
  useEffect(() => {
    if (committed(urlValue) !== lastWritten.current) {
      lastWritten.current = committed(urlValue);
      setInput(urlValue);
    }
  }, [urlValue]);

  // Typing settled: write it to the URL once
  useEffect(() => {
    if (debounced === lastWritten.current) return;
    lastWritten.current = debounced;
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (debounced) next.set(name, debounced);
        else next.delete(name);
        return next;
      },
      { replace: true },
    );
  }, [debounced, name, setSearchParams]);

  return { input, setInput, urlValue } as const;
}
