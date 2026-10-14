import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { useAuth } from "@/features/auth";

export function RequireAuth({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "checking") {
    return (
      <div
        className="flex min-h-[400px] items-center justify-center p-8"
        data-testid="auth-loading"
      >
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (status === "guest") {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}
