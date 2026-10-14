import type { PendingRegistrationSession } from "@/types";

const PENDING_REGISTRATION_KEY = "ecom.pendingRegistration";

export function savePendingRegistration(data: {
  displayName: string;
  email: string;
  password: string;
  resendAvailableInSeconds: number;
  verificationExpiresInSeconds: number;
}): PendingRegistrationSession {
  const now = Date.now();
  const session: PendingRegistrationSession = {
    displayName: data.displayName,
    email: data.email,
    password: data.password,
    resendAvailableAt: now + data.resendAvailableInSeconds * 1000,
    verificationExpiresAt: now + data.verificationExpiresInSeconds * 1000,
  };

  try {
    sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(session));
  } catch {
    // Storage quota or blocked
  }

  return session;
}

export function getPendingRegistration(): PendingRegistrationSession | null {
  try {
    const raw = sessionStorage.getItem(PENDING_REGISTRATION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PendingRegistrationSession;

    // If verification has expired, clean up and return null
    if (session.verificationExpiresAt <= Date.now()) {
      clearPendingRegistration();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function updatePendingRegistrationResend(
  resendAvailableInSeconds: number,
): void {
  const current = getPendingRegistration();
  if (!current) return;
  current.resendAvailableAt = Date.now() + resendAvailableInSeconds * 1000;
  try {
    sessionStorage.setItem(PENDING_REGISTRATION_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function clearPendingRegistration(): void {
  try {
    sessionStorage.removeItem(PENDING_REGISTRATION_KEY);
  } catch {
    // ignore
  }
}
