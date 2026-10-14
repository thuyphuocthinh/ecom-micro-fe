import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../../features/auth";
import { sanitizeReturnTo } from "../../utils/redirect.ts";

/**
 * Redirects authenticated users away from guest-only pages (e.g. /login, /register)
 * back to `returnTo` or home `/`.
 */
export function useGuestOnly(customReturnTo?: string) {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(
    customReturnTo ?? searchParams.get("returnTo"),
  );

  useEffect(() => {
    if (status === "signedIn") {
      navigate(returnTo, { replace: true });
    }
  }, [status, returnTo, navigate]);

  return { status, returnTo };
}
