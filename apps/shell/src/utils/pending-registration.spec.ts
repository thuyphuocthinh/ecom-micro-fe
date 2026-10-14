import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  savePendingRegistration,
  getPendingRegistration,
  updatePendingRegistrationResend,
  clearPendingRegistration,
} from "./pending-registration.ts";

describe("pending-registration", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("saves and retrieves pending registration session", () => {
    const session = savePendingRegistration({
      displayName: "Nguyễn Văn A",
      email: "a@ecom.vn",
      password: "password123",
      resendAvailableInSeconds: 60,
      verificationExpiresInSeconds: 900,
    });

    const retrieved = getPendingRegistration();
    expect(retrieved).not.toBeNull();
    expect(retrieved?.email).toBe("a@ecom.vn");
    expect(retrieved?.displayName).toBe("Nguyễn Văn A");
    expect(retrieved?.resendAvailableAt).toBe(session.resendAvailableAt);
  });

  it("returns null and clears storage when verification expired", () => {
    vi.useFakeTimers();
    savePendingRegistration({
      displayName: "Nguyễn Văn A",
      email: "a@ecom.vn",
      password: "password123",
      resendAvailableInSeconds: 60,
      verificationExpiresInSeconds: 900,
    });

    // Advance 901 seconds
    vi.advanceTimersByTime(901 * 1000);

    expect(getPendingRegistration()).toBeNull();
    expect(sessionStorage.getItem("ecom.pendingRegistration")).toBeNull();

    vi.useRealTimers();
  });

  it("updates resend countdown timestamp", () => {
    savePendingRegistration({
      displayName: "Nguyễn Văn A",
      email: "a@ecom.vn",
      password: "password123",
      resendAvailableInSeconds: 10,
      verificationExpiresInSeconds: 900,
    });

    updatePendingRegistrationResend(120);
    const updated = getPendingRegistration();
    expect(updated?.resendAvailableAt).toBeGreaterThan(Date.now() + 100 * 1000);
  });

  it("clears pending registration manually", () => {
    savePendingRegistration({
      displayName: "Nguyễn Văn A",
      email: "a@ecom.vn",
      password: "password123",
      resendAvailableInSeconds: 60,
      verificationExpiresInSeconds: 900,
    });

    clearPendingRegistration();
    expect(getPendingRegistration()).toBeNull();
  });
});
