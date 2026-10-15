import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import type { RegisterPayload, RegisterResponseData } from "@/types";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await authService.register(payload);
      return (res.data || {}) as RegisterResponseData;
    },
  });
}
