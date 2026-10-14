import type { PendingPasswordResetSession } from "@/types";

const PENDING_PASSWORD_RESET_KEY = "ecom.pendingPasswordReset";

export function savePendingPasswordReset(data: {
  email: string;
  resendAvailableInSeconds: number;
  expiresInSeconds?: number;
}): PendingPasswordResetSession {
  const now = Date.now();
  const session: PendingPasswordResetSession = {
    email: data.email,
    resendAvailableAt: now + data.resendAvailableInSeconds * 1000,
    expiresAt: now + (data.expiresInSeconds ?? 900) * 1000,
  };

  try {
    sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, JSON.stringify(session));
  } catch {
    // Storage quota or blocked
  }

  return session;
}

export function getPendingPasswordReset(): PendingPasswordResetSession | null {
  try {
    const raw = sessionStorage.getItem(PENDING_PASSWORD_RESET_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as PendingPasswordResetSession;

    // If session has expired, clean up and return null
    if (session.expiresAt <= Date.now()) {
      clearPendingPasswordReset();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

export function updatePendingPasswordResetResend(
  resendAvailableInSeconds: number,
): void {
  const current = getPendingPasswordReset();
  if (!current) return;
  current.resendAvailableAt = Date.now() + resendAvailableInSeconds * 1000;
  try {
    sessionStorage.setItem(PENDING_PASSWORD_RESET_KEY, JSON.stringify(current));
  } catch {
    // ignore
  }
}

export function clearPendingPasswordReset(): void {
  try {
    sessionStorage.removeItem(PENDING_PASSWORD_RESET_KEY);
  } catch {
    // ignore
  }
}
