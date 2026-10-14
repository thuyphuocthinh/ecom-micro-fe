import { useState, useEffect, useCallback } from "react";

export interface UseCountdownOptions {
  seconds?: number;
  targetTimestamp?: number;
}

export function useCountdown(initial: number | UseCountdownOptions) {
  const targetTimestamp =
    typeof initial === "object" ? initial.targetTimestamp : undefined;
  const initialSeconds =
    typeof initial === "number" ? initial : (initial.seconds ?? 0);

  const calculateRemaining = useCallback((): number => {
    if (targetTimestamp !== undefined) {
      return Math.max(0, Math.ceil((targetTimestamp - Date.now()) / 1000));
    }
    return Math.max(0, Math.floor(initialSeconds));
  }, [initialSeconds, targetTimestamp]);

  const [countdown, setCountdown] = useState(calculateRemaining);
  const [currentTarget, setCurrentTarget] = useState<number | undefined>(
    targetTimestamp,
  );

  // Track previous primitive values to prevent infinite loops when options are passed as object literals
  const [prevTarget, setPrevTarget] = useState(targetTimestamp);
  const [prevSeconds, setPrevSeconds] = useState(initialSeconds);

  if (targetTimestamp !== prevTarget || initialSeconds !== prevSeconds) {
    setPrevTarget(targetTimestamp);
    setPrevSeconds(initialSeconds);
    setCurrentTarget(targetTimestamp);
    setCountdown(calculateRemaining());
  }

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      if (currentTarget !== undefined) {
        const rem = Math.max(0, Math.ceil((currentTarget - Date.now()) / 1000));
        setCountdown(rem);
      } else {
        setCountdown((prev) => Math.max(0, prev - 1));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, currentTarget]);

  const resetCountdown = useCallback(
    (newVal: number | { targetTimestamp: number }) => {
      if (typeof newVal === "object") {
        setCurrentTarget(newVal.targetTimestamp);
        setCountdown(
          Math.max(0, Math.ceil((newVal.targetTimestamp - Date.now()) / 1000)),
        );
      } else {
        setCurrentTarget(undefined);
        setCountdown(Math.max(0, Math.floor(newVal)));
      }
    },
    [],
  );

  return {
    countdown,
    isRunning: countdown > 0,
    resetCountdown,
  };
}
