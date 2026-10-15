import { useMutation } from "@tanstack/react-query";
import { authService } from "@/services/auth.service.ts";
import type {
  ResendVerificationPayload,
  ResendVerificationResponseData,
} from "@/types";

export function useResendCodeMutation() {
  return useMutation({
    mutationFn: async (payload: ResendVerificationPayload) => {
      const res = await authService.resendVerification(payload);
      return (res.data || {}) as ResendVerificationResponseData;
    },
  });
}
