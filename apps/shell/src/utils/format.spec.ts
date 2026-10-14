import { describe, it, expect } from "vitest";
import { formatDurationMmSs, secondsToMinutesCeil } from "./format.ts";

describe("formatDurationMmSs", () => {
  it("formats positive seconds into mm:ss", () => {
    expect(formatDurationMmSs(0)).toBe("00:00");
    expect(formatDurationMmSs(5)).toBe("00:05");
    expect(formatDurationMmSs(59)).toBe("00:59");
    expect(formatDurationMmSs(60)).toBe("01:00");
    expect(formatDurationMmSs(65)).toBe("01:05");
    expect(formatDurationMmSs(300)).toBe("05:00");
  });

  it("handles negative or decimal values safely", () => {
    expect(formatDurationMmSs(-10)).toBe("00:00");
    expect(formatDurationMmSs(65.8)).toBe("01:05");
  });
});

describe("secondsToMinutesCeil", () => {
  it("rounds up seconds to nearest minute", () => {
    expect(secondsToMinutesCeil(0)).toBe(0);
    expect(secondsToMinutesCeil(-5)).toBe(0);
    expect(secondsToMinutesCeil(1)).toBe(1);
    expect(secondsToMinutesCeil(60)).toBe(1);
    expect(secondsToMinutesCeil(61)).toBe(2);
    expect(secondsToMinutesCeil(900)).toBe(15);
  });
});
