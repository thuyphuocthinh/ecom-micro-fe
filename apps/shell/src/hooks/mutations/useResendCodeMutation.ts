import { useMutation } from "@tanstack/react-query";
import {
  authService,
  type ResendVerificationPayload,
  type ResendVerificationResponseData,
} from "../../services/auth.service.ts";

export function useResendCodeMutation() {
  return useMutation({
    mutationFn: async (payload: ResendVerificationPayload) => {
      const res = await authService.resendVerification(payload);
      return (res.data || {}) as ResendVerificationResponseData;
    },
  });
}
