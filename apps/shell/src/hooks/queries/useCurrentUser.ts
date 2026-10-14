import { useQuery } from "@tanstack/react-query";
import { session } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { userService } from "@/services/user.service.ts";
import type { UserProfile } from "@/types";

export function useCurrentUser() {
  const hasToken =
    typeof window !== "undefined" &&
    Boolean(session.getAccessToken() || session.getRefreshToken());

  return useQuery({
    queryKey: queryKeys.user.me(),
    queryFn: async () => {
      try {
        const res = await userService.getMe({ silent: true });
        return res.data as unknown as UserProfile;
      } catch (err) {
        // If restoring user session fails, clear the invalid token (AC-19)
        session.clear();
        throw err;
      }
    },
    enabled: hasToken,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
}
