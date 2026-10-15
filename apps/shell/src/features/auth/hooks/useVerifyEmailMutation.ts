import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import { useAuth } from "@/features/auth/auth-context.ts";
import type { VerifyEmailPayload, AuthTokens } from "@/types";

export function useVerifyEmailMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (payload: VerifyEmailPayload) => {
      const res = await authService.verifyEmail(payload);
      const tokens = res.data as unknown as AuthTokens;
      await login(tokens);
      return tokens;
    },
  });
}
