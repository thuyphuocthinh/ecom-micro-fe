import { api } from "@ecom/api";

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

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RegisterResponseData {
  verificationRequired: boolean;
  resendAvailableInSeconds?: number;
  verificationExpiresInSeconds?: number;
}

export interface ResendVerificationResponseData {
  resendAvailableInSeconds: number;
}

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
