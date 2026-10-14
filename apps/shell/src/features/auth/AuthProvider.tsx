import { useState, useEffect, useCallback, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { session } from "@ecom/api";
import { queryKeys } from "../../constants/queryKeys.ts";
import { userService } from "../../services/user.service.ts";
import { useCurrentUser } from "../../hooks/queries/useCurrentUser.ts";
import { useCartCount } from "../../hooks/queries/useCartCount.ts";
import { useLogoutMutation } from "../../hooks/mutations/useLogoutMutation.ts";
import {
  AuthContext,
  type AuthStatus,
  type UserProfile,
} from "./auth-context.ts";

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

  // Session expired listener (AC-23)
  useEffect(() => {
    return session.onExpired(() => {
      session.clear();
      queryClient.setQueryData(queryKeys.user.me(), null);
      queryClient.clear();
      setSessionKey((k) => k + 1);
      toast.info("Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.");
    });
  }, [queryClient]);

  // Multi-tab storage sync (AC-27)
  useEffect(() => {
    const handleStorage = async (e: StorageEvent) => {
      if (e.key === "ecom.accessToken" || e.key === "ecom.refreshToken") {
        const token = session.getAccessToken() || session.getRefreshToken();
        if (!token) {
          session.clear();
          queryClient.setQueryData(queryKeys.user.me(), null);
          queryClient.clear();
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
            queryClient.setQueryData(queryKeys.user.me(), null);
            queryClient.clear();
            setSessionKey((k) => k + 1);
          }
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [queryClient]);

  // Cart query managed via dedicated query hook (AC-21)
  const { cartCount } = useCartCount(status === "signedIn");

  const logoutMutation = useLogoutMutation();

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
    await logoutMutation.mutateAsync();
    setSessionKey((k) => k + 1);
  }, [logoutMutation]);

  return (
    <AuthContext.Provider value={{ status, user, cartCount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
