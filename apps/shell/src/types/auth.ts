export type AuthStatus = "checking" | "guest" | "signedIn";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  displayName?: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
  password: string;
}

export interface ResendVerificationPayload {
  email: string;
}

export interface RegisterResponseData {
  verificationRequired: boolean;
  resendAvailableInSeconds?: number;
  verificationExpiresInSeconds?: number;
}

export interface ResendVerificationResponseData {
  resendAvailableInSeconds: number;
}

export interface RegisterStep1SuccessPayload {
  displayName: string;
  email: string;
  password: string;
  resendAvailableInSeconds: number;
  verificationExpiresInSeconds: number;
}

export interface PendingRegistrationSession {
  displayName: string;
  email: string;
  password: string;
  resendAvailableAt: number; // Unix timestamp in ms
  verificationExpiresAt: number; // Unix timestamp in ms
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ForgotPasswordResponseData {
  resendAvailableInSeconds: number;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  newPassword: string;
}

export interface PendingPasswordResetSession {
  email: string;
  resendAvailableAt: number; // Unix timestamp in ms
  expiresAt: number; // Unix timestamp in ms
}

export interface GoogleLoginPayload {
  idToken: string;
  nonce?: string;
}

export interface GoogleLoginResponseData {
  accessToken: string;
  refreshToken: string;
  isNewUser: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
