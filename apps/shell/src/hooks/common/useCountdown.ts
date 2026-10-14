import { useState, useEffect, useCallback } from "react";

export function useCountdown(initialSeconds: number) {
  const [prevInitial, setPrevInitial] = useState(initialSeconds);
  const [countdown, setCountdown] = useState(initialSeconds);

  // Adjust state during render when prop changes without cascading effect
  if (prevInitial !== initialSeconds) {
    setPrevInitial(initialSeconds);
    setCountdown(initialSeconds);
  }

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const resetCountdown = useCallback((seconds: number) => {
    setCountdown(Math.max(0, Math.floor(seconds)));
  }, []);

  return {
    countdown,
    isRunning: countdown > 0,
    resetCountdown,
  };
}
