import { useState } from "react";
import { useGuestOnly } from "@/hooks/common";
import { RegisterForm } from "@/features/auth/RegisterForm.tsx";
import {
  VerifyEmailStep,
  type VerifyEmailStepPayload,
} from "@/features/auth/VerifyEmailStep.tsx";
import {
  savePendingRegistration,
  getPendingRegistration,
  clearPendingRegistration,
} from "@/utils/pending-registration.ts";
import type { RegisterStep1SuccessPayload } from "@/types";

export function RegisterPage() {
  useGuestOnly();

  const [stepPayload, setStepPayload] = useState<VerifyEmailStepPayload | null>(
    () => getPendingRegistration(),
  );
  const [savedValues, setSavedValues] = useState<{
    displayName: string;
    email: string;
  } | null>(() => {
    const pending = getPendingRegistration();
    return pending
      ? { displayName: pending.displayName, email: pending.email }
      : null;
  });

  const handleStep1Success = (payload: RegisterStep1SuccessPayload) => {
    setSavedValues({ displayName: payload.displayName, email: payload.email });
    const session = savePendingRegistration(payload);
    setStepPayload(session);
  };

  const handleBack = () => {
    clearPendingRegistration();
    setStepPayload(null);
  };

  const handleSessionExpired = () => {
    clearPendingRegistration();
    setStepPayload(null);
  };

  if (stepPayload) {
    return (
      <VerifyEmailStep
        payload={stepPayload}
        onBack={handleBack}
        onSessionExpired={handleSessionExpired}
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
