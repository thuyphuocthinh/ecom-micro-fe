/**
 * Formats a duration in seconds into `mm:ss` string format.
 * E.g., 65 -> "01:05", 2 -> "00:02", 0 -> "00:00"
 */
export function formatDurationMmSs(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(safeSeconds / 60);
  const s = safeSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/**
 * Rounds seconds up to the nearest whole minute.
 * E.g., 900 -> 15, 61 -> 2, 60 -> 1, 0 -> 0
 */
export function secondsToMinutesCeil(seconds: number): number {
  if (seconds <= 0) return 0;
  return Math.ceil(seconds / 60);
}
