import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { session } from "@ecom/api";
import { queryKeys } from "@/constants/queryKeys.ts";
import { userService } from "@/services/user.service.ts";
import { useCurrentUser } from "@/features/profile/hooks/useCurrentUser.ts";
import { useCartCount } from "@/hooks/common/useCartCount.ts";
import { useLogoutMutation } from "@/features/auth/hooks/useLogoutMutation.ts";
import { clearUserData } from "@/utils/query-cache.ts";
import { AuthContext } from "./auth-context.ts";
import type { AuthStatus, UserProfile } from "@/types";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [, setSessionKey] = useState(0);

  const hasToken =
    typeof window !== "undefined" &&
    Boolean(session.getAccessToken() || session.getRefreshToken());

  const userQuery = useCurrentUser();
  const user = userQuery.data ?? null;

  // Derive status purely during render
  let status: AuthStatus = "guest";
  if (hasToken) {
    if (userQuery.isLoading) {
      status = "checking";
    } else if (user) {
      status = "signedIn";
    } else {
      status = "guest";
    }
  } else {
    status = "guest";
  }

  // Only a person who was shown as signed in is told the session expired. A token that was already dead
  // when the page opened is a quiet return to guest (AC-19), not a message out of nowhere.
  const wasSignedIn = useRef(false);
  useEffect(() => {
    if (status === "signedIn") wasSignedIn.current = true;
  }, [status]);

  // Session expired listener (AC-23)
  useEffect(() => {
    return session.onExpired(() => {
      const shouldTell = wasSignedIn.current;
      wasSignedIn.current = false;
      session.clear();
      clearUserData(queryClient);
      setSessionKey((k) => k + 1);
      if (shouldTell) {
        toast.info("Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.");
      }
    });
  }, [queryClient]);

  // Multi-tab storage sync (AC-27)
  useEffect(() => {
    const handleStorage = async (e: StorageEvent) => {
      if (e.key === "ecom.accessToken" || e.key === "ecom.refreshToken") {
        const token = session.getAccessToken() || session.getRefreshToken();
        if (!token) {
          session.clear();
          clearUserData(queryClient);
          setSessionKey((k) => k + 1);
        } else {
          try {
            const res = await userService.getMe({ silent: true });
            queryClient.setQueryData(
              queryKeys.user.me(),
              res.data as unknown as UserProfile,
            );
            setSessionKey((k) => k + 1);
            void queryClient.invalidateQueries({
              queryKey: queryKeys.cart.all,
            });
          } catch {
            session.clear();
            clearUserData(queryClient);
            setSessionKey((k) => k + 1);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient]);

  // The cart count is asked as soon as there is a token, at the same time as /users/me, not after it
  // (AC-3): the two do not depend on each other, so waiting would only add a round trip.
  const { cartCount } = useCartCount(hasToken);

  // `mutateAsync` keeps the same identity between renders (the mutation object does not)
  const { mutateAsync: logoutAsync } = useLogoutMutation();

  const login = useCallback(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      session.set(tokens);
      try {
        const res = await userService.getMe();
        queryClient.setQueryData(
          queryKeys.user.me(),
          res.data as unknown as UserProfile,
        );
      } catch {
        void queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
      }
      setSessionKey((k) => k + 1);
      void queryClient.invalidateQueries({ queryKey: queryKeys.cart.all });
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    await logoutAsync();
    setSessionKey((k) => k + 1);
  }, [logoutAsync]);

  // One object until something it holds changes: components that read the auth context are not
  // re-rendered each time the provider renders for another reason (AC-6)
  const value = useMemo(
    () => ({ status, user, cartCount, login, logout }),
    [status, user, cartCount, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
