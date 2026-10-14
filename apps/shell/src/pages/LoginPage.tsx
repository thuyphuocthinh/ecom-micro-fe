import { useGuestOnly } from "../hooks/common/useGuestOnly.ts";
import { LoginForm } from "../features/auth/LoginForm.tsx";

export function LoginPage() {
  useGuestOnly();
  return <LoginForm />;
}
