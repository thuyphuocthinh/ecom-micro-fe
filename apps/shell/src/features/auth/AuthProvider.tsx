import { useEffect, useState, useCallback, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api, session } from "@ecom/api";
import {
  AuthContext,
  type AuthStatus,
  type UserProfile,
} from "./auth-context.ts";

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const [status, setStatus] = useState<AuthStatus>(() => {
    const hasToken =
      typeof window !== "undefined" &&
      Boolean(session.getAccessToken() || session.getRefreshToken());
    return hasToken ? "checking" : "guest";
  });
  const [user, setUser] = useState<UserProfile | null>(null);

  // Restore session or check user (AC-18, AC-19)
  const refreshUser = useCallback(async () => {
    const token = session.getAccessToken() || session.getRefreshToken();
    if (!token) {
      setUser(null);
      setStatus("guest");
      return;
    }

    try {
      const res = await api.get("/users/me", { silent: true });
      setUser(res.data as unknown as UserProfile);
      setStatus("signedIn");
    } catch {
      session.clear();
      setUser(null);
      setStatus("guest");
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const token = session.getAccessToken() || session.getRefreshToken();
    if (!token) return;

    api
      .get("/users/me", { silent: true })
      .then((res) => {
        if (!cancelled) {
          setUser(res.data as unknown as UserProfile);
          setStatus("signedIn");
        }
      })
      .catch(() => {
        if (!cancelled) {
          session.clear();
          setUser(null);
          setStatus("guest");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Session expired listener (AC-23)
  useEffect(() => {
    return session.onExpired(() => {
      session.clear();
      setUser(null);
      setStatus("guest");
      queryClient.clear();
      toast.info("Phiên đăng nhập đã hết hạn, hãy đăng nhập lại.");
    });
  }, [queryClient]);

  // Multi-tab storage sync (AC-27)
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "ecom.accessToken" || e.key === "ecom.refreshToken") {
        void refreshUser();
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshUser]);

  // Cart query (AC-21: only when signedIn)
  const cartQuery = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await api.get("/cart");
      return res.data;
    },
    enabled: status === "signedIn",
    staleTime: 1000 * 60,
  });

  // Listen for cart:changed event (AC-21)
  useEffect(() => {
    const handleCartChanged = () => {
      if (status === "signedIn") {
        void queryClient.invalidateQueries({ queryKey: ["cart"] });
      }
    };
    window.addEventListener("cart:changed", handleCartChanged);
    return () => window.removeEventListener("cart:changed", handleCartChanged);
  }, [status, queryClient]);

  const login = useCallback(
    async (tokens: { accessToken: string; refreshToken: string }) => {
      session.set(tokens);
      try {
        const res = await api.get("/users/me");
        setUser(res.data as unknown as UserProfile);
        setStatus("signedIn");
        void queryClient.invalidateQueries({ queryKey: ["cart"] });
      } catch {
        setStatus("signedIn");
      }
    },
    [queryClient],
  );

  const logout = useCallback(async () => {
    try {
      // AC-22: logout with silent: true; if it fails (offline), still clear locally
      await api.post("/auth/logout", { silent: true });
    } catch {
      // ignore
    } finally {
      session.clear();
      setUser(null);
      setStatus("guest");
      queryClient.clear();
    }
  }, [queryClient]);

  const cartCount =
    status === "signedIn" ? (cartQuery.data?.lineCount ?? 0) : 0;

  return (
    <AuthContext.Provider value={{ status, user, cartCount, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
