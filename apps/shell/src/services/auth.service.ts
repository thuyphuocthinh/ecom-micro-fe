import { api } from "@ecom/api";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  GoogleLoginPayload,
} from "@/types";

export type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  AuthTokens,
  RegisterResponseData,
  ResendVerificationResponseData,
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
  ResetPasswordPayload,
  PendingPasswordResetSession,
  GoogleLoginPayload,
  GoogleLoginResponseData,
} from "@/types";

export const authService = {
  login(payload: LoginPayload) {
    return api.post("/auth/login", {
      body: {
        email: payload.email,
        password: payload.password,
      },
    });
  },

  register(payload: RegisterPayload) {
    return api.post("/auth/register", {
      body: {
        displayName: payload.displayName,
        email: payload.email,
        password: payload.password,
      },
    });
  },

  verifyEmail(payload: VerifyEmailPayload) {
    return api.post("/auth/verify-email", {
      body: {
        email: payload.email,
        code: payload.code,
        password: payload.password,
      },
    });
  },

  resendVerification(payload: ResendVerificationPayload) {
    return api.post("/auth/resend-verification", {
      body: {
        email: payload.email,
      },
    });
  },

  forgotPassword(payload: ForgotPasswordPayload) {
    return api.post("/auth/forgot-password", {
      body: {
        email: payload.email,
      },
    });
  },

  resetPassword(payload: ResetPasswordPayload) {
    return api.post("/auth/reset-password", {
      body: {
        email: payload.email,
        code: payload.code,
        newPassword: payload.newPassword,
      },
    });
  },

  loginWithGoogle(payload: GoogleLoginPayload) {
    return api.post("/auth/google", {
      body: {
        idToken: payload.idToken,
        nonce: payload.nonce,
      },
    });
  },

  changePassword(payload: { currentPassword: string; newPassword: string }) {
    return api.post("/auth/change-password", {
      body: {
        currentPassword: payload.currentPassword,
        newPassword: payload.newPassword,
      },
    });
  },

  logout() {
    return api.post("/auth/logout", { silent: true });
  },
};
