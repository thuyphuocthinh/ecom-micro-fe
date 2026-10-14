import { useMutation, useQueryClient } from "@tanstack/react-query";
import { session } from "@ecom/api";
import { authService } from "../../services/auth.service.ts";

export function useLogoutMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        await authService.logout();
      } catch {
        // Ignore network / offline error on logout (AC-22)
      } finally {
        session.clear();
        queryClient.clear();
      }
    },
  });
}
