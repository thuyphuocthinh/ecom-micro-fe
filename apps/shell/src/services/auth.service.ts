import { api } from "@ecom/api";
import type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
} from "@/types";

export type {
  LoginPayload,
  RegisterPayload,
  VerifyEmailPayload,
  ResendVerificationPayload,
  AuthTokens,
  RegisterResponseData,
  ResendVerificationResponseData,
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

  logout() {
    return api.post("/auth/logout", { silent: true });
  },
};
