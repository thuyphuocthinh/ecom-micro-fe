import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import { useAuth } from "@/features/auth/auth-context.ts";
import type { LoginPayload, AuthTokens } from "@/types";

export function useLoginMutation() {
  const { login } = useAuth();

  return useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const res = await authService.login(payload);
      const tokens = res.data as unknown as AuthTokens;
      await login(tokens);
      return tokens;
    },
  });
}
