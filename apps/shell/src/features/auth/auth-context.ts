import { createContext, useContext } from "react";

export type AuthStatus = "checking" | "guest" | "signedIn";

export interface UserProfile {
  id: string;
  role: "CUSTOMER" | "ADMIN";
  displayName?: string | null;
  avatarUrl?: string | null;
  email?: string | null;
}

export interface AuthContextValue {
  status: AuthStatus;
  user: UserProfile | null;
  cartCount: number;
  login: (tokens: {
    accessToken: string;
    refreshToken: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
