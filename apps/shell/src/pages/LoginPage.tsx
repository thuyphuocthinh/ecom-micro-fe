import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../features/auth";
import { sanitizeReturnTo } from "../utils/redirect.ts";
import { LoginForm } from "../features/auth/LoginForm.tsx";

export function LoginPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  useEffect(() => {
    if (status === "signedIn") {
      navigate(returnTo, { replace: true });
    }
  }, [status, returnTo, navigate]);

  return <LoginForm />;
}
