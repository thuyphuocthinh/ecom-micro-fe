import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import type { ResetPasswordPayload } from "@/types";

export function useResetPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ResetPasswordPayload) => {
      await authService.resetPassword(payload);
    },
  });
}
