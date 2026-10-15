import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import type {
  ForgotPasswordPayload,
  ForgotPasswordResponseData,
} from "@/types";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: async (payload: ForgotPasswordPayload) => {
      const res = await authService.forgotPassword(payload);
      return (res.data || {}) as ForgotPasswordResponseData;
    },
  });
}
