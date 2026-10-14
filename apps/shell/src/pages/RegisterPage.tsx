import { useState } from "react";
import { useGuestOnly } from "../hooks/common/useGuestOnly.ts";
import {
  RegisterForm,
  type RegisterStep1SuccessPayload,
} from "../features/auth/RegisterForm.tsx";
import { VerifyEmailStep } from "../features/auth/VerifyEmailStep.tsx";

export function RegisterPage() {
  useGuestOnly();

  const [stepPayload, setStepPayload] =
    useState<RegisterStep1SuccessPayload | null>(null);
  const [savedValues, setSavedValues] = useState<{
    displayName: string;
    email: string;
  } | null>(null);

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
