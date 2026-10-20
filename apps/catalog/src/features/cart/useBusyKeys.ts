import { useCallback, useRef, useState } from "react";

/**
 * Keeps an action from running twice for the same thing at the same time (a product being added to
 * the cart, say). The ref answers at once, so two presses in the same moment cannot both get through;
 * the state is what a screen shows (a spinner on that product's button).
 */
export function useBusyKeys() {
  const running = useRef(new Set<string>());
  const [busy, setBusy] = useState<ReadonlySet<string>>(new Set());

  /** Runs `action` unless one is already running for `key`; the key is busy until it ends. */
  const run = useCallback(async (key: string, action: () => Promise<void>) => {
    if (running.current.has(key)) return;
    running.current.add(key);
    setBusy(new Set(running.current));
    try {
      await action();
    } finally {
      running.current.delete(key);
      setBusy(new Set(running.current));
    }
  }, []);

  const isBusy = useCallback((key: string) => busy.has(key), [busy]);

  return { run, isBusy };
}
