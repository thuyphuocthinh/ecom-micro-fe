import { useMutation, useQueryClient } from "@tanstack/react-query";
import { session } from "@ecom/api";
import { authService } from "@/services/auth.service.ts";
import { clearUserData } from "@/utils/query-cache.ts";

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
        // Only the person's data: the public pages keep what they have cached
        clearUserData(queryClient);
      }
    },
  });
}
