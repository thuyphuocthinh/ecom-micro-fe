import { useGuestOnly } from "@/hooks/common";
import { LoginForm } from "@/features/auth/LoginForm.tsx";

export function LoginPage() {
  useGuestOnly();
  return <LoginForm />;
}
