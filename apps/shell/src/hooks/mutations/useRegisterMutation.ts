import { useMutation } from "@tanstack/react-query";
import {
  authService,
  type RegisterPayload,
  type RegisterResponseData,
} from "../../services/auth.service.ts";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const res = await authService.register(payload);
      return (res.data || {}) as RegisterResponseData;
    },
  });
}
