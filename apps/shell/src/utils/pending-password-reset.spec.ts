import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePendingPasswordReset,
  getPendingPasswordReset,
  updatePendingPasswordResetResend,
  clearPendingPasswordReset,
} from "./pending-password-reset.ts";

describe("pending-password-reset", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves and retrieves pending password reset session", () => {
    const session = savePendingPasswordReset({
      email: "user@ecom.vn",
      resendAvailableInSeconds: 300,
    });

    const retrieved = getPendingPasswordReset();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe("user@ecom.vn");
    expect(retrieved?.resendAvailableAt).toBe(session.resendAvailableAt);
  });

  it("returns null and clears storage when session expired", () => {
    vi.useFakeTimers();
    savePendingPasswordReset({
      email: "user@ecom.vn",
      resendAvailableInSeconds: 300,
      expiresInSeconds: 900,
    });

    // Advance 901 seconds
    vi.advanceTimersByTime(901 * 1000);

    expect(getPendingPasswordReset()).toBeNull();
    expect(sessionStorage.getItem("ecom.pendingPasswordReset")).toBeNull();

    vi.useRealTimers();
  });

  it("updates resend countdown timestamp", () => {
    savePendingPasswordReset({
      email: "user@ecom.vn",
      resendAvailableInSeconds: 10,
    });

    updatePendingPasswordResetResend(300);
    const updated = getPendingPasswordReset();
    expect(updated?.resendAvailableAt).toBeGreaterThan(Date.now() + 250 * 1000);
  });

  it("clears pending password reset manually", () => {
    savePendingPasswordReset({
      email: "user@ecom.vn",
      resendAvailableInSeconds: 300,
    });

    clearPendingPasswordReset();
    expect(getPendingPasswordReset()).toBeNull();
  });
});
