import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { useAuth } from "../features/auth";
import { sanitizeReturnTo } from "../utils/redirect.ts";
import {
  RegisterForm,
  type RegisterStep1SuccessPayload,
} from "../features/auth/RegisterForm.tsx";
import { VerifyEmailStep } from "../features/auth/VerifyEmailStep.tsx";

export function RegisterPage() {
  const { status } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const [stepPayload, setStepPayload] =
    useState<RegisterStep1SuccessPayload | null>(null);
  const [savedValues, setSavedValues] = useState<{
    displayName: string;
    email: string;
  } | null>(null);

  useEffect(() => {
    if (status === "signedIn") {
      navigate(returnTo, { replace: true });
    }
  }, [status, returnTo, navigate]);

  const handleStep1Success = (payload: RegisterStep1SuccessPayload) => {
    setSavedValues({ displayName: payload.displayName, email: payload.email });
    setStepPayload(payload);
  };

  if (stepPayload) {
    return (
      <VerifyEmailStep
        payload={stepPayload}
        onBack={() => setStepPayload(null)}
        onSessionExpired={() => setStepPayload(null)}
      />
    );
  }

  return (
    <RegisterForm
      onSuccess={handleStep1Success}
      initialValues={savedValues || undefined}
    />
  );
}
