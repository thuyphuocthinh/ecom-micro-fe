import { useEffect, useState } from "react";
import {
  calculateSecondsLeft,
  formatCountdown,
} from "@/features/checkout/utils";

export interface PaymentCountdownTimerProps {
  expiresAt: string | null | undefined;
  onExpire?: () => void;
}

export function PaymentCountdownTimer({
  expiresAt,
  onExpire,
}: PaymentCountdownTimerProps) {
  const [prevExpiresAt, setPrevExpiresAt] = useState(expiresAt);
  const [secondsLeft, setSecondsLeft] = useState<number>(() =>
    calculateSecondsLeft(expiresAt),
  );

  if (expiresAt !== prevExpiresAt) {
    setPrevExpiresAt(expiresAt);
    setSecondsLeft(calculateSecondsLeft(expiresAt));
  }

  useEffect(() => {
    if (!expiresAt) return;

    const timer = setInterval(() => {
      const left = calculateSecondsLeft(expiresAt);
      setSecondsLeft(left);
      if (left <= 0) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  const { timeFormatted, timeSpoken, isUrgent } = formatCountdown(secondsLeft);

  return (
    <div className="flex flex-col items-end">
      <span className="text-xs text-muted">Hàng được giữ trong</span>
      <p
        role="timer"
        aria-label={`Thời gian còn lại ${timeSpoken}`}
        className={`font-head font-bold text-3xl sm:text-4xl tracking-tight transition-colors ${
          isUrgent ? "text-sale" : "text-ink"
        }`}
      >
        {timeFormatted}
      </p>
    </div>
  );
}
