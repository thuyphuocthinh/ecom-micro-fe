export function calculateSecondsLeft(
  expiresAt: string | null | undefined,
): number {
  if (!expiresAt) return 15 * 60;
  const diff = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return Math.max(0, diff);
}

export function formatCountdown(secondsLeft: number) {
  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
  const timeSpoken = `${minutes} phút ${seconds} giây`;
  const isUrgent = secondsLeft <= 120; // 2 minutes or less

  return {
    minutes,
    seconds,
    timeFormatted,
    timeSpoken,
    isUrgent,
  };
}
