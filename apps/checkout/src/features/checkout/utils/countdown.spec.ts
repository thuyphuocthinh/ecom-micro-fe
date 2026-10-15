import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { calculateSecondsLeft, formatCountdown } from "./countdown";

describe("countdown utils", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-15T10:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("calculates seconds left correctly", () => {
    const futureDate = "2026-10-15T10:15:00Z";
    expect(calculateSecondsLeft(futureDate)).toBe(15 * 60);

    const pastDate = "2026-10-15T09:59:00Z";
    expect(calculateSecondsLeft(pastDate)).toBe(0);

    expect(calculateSecondsLeft(null)).toBe(15 * 60);
  });

  it("formats countdown accurately", () => {
    const formatted = formatCountdown(130);
    expect(formatted.minutes).toBe(2);
    expect(formatted.seconds).toBe(10);
    expect(formatted.timeFormatted).toBe("02:10");
    expect(formatted.timeSpoken).toBe("2 phút 10 giây");
    expect(formatted.isUrgent).toBe(false);

    const urgent = formatCountdown(120);
    expect(urgent.isUrgent).toBe(true);
  });
});
