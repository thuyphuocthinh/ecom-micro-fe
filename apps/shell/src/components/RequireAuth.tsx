import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router";
import { Spinner } from "@ecom/ui";
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
        <Spinner className="size-8 text-brand" />
      </div>
    );
  }

  if (status === "guest") {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnTo=${returnTo}`} replace />;
  }

  return <>{children}</>;
}
