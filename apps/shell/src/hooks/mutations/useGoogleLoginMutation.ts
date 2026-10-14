import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import { useAuth } from "@/features/auth/auth-context.ts";
import type { GoogleLoginPayload, GoogleLoginResponseData } from "@/types";

export function useGoogleLoginMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (payload: GoogleLoginPayload) => {
      const res = await authService.loginWithGoogle(payload);
      const data = res.data as unknown as GoogleLoginResponseData;
      await login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
      });
      return data;
    },
  });
}
