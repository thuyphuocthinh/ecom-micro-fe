import { useState } from "react";
import { useGuestOnly } from "@/hooks/common";
import { ForgotPasswordForm } from "@/features/auth/ForgotPasswordForm.tsx";
import {
  ResetPasswordStep,
  type ResetPasswordStepPayload,
} from "@/features/auth/ResetPasswordStep.tsx";
import {
  savePendingPasswordReset,
  getPendingPasswordReset,
  clearPendingPasswordReset,
} from "@/utils/pending-password-reset.ts";

export function ForgotPasswordPage() {
  useGuestOnly();

  const [stepPayload, setStepPayload] =
    useState<ResetPasswordStepPayload | null>(() => getPendingPasswordReset());
  const [savedEmail, setSavedEmail] = useState<string | null>(() => {
    const pending = getPendingPasswordReset();
    return pending ? pending.email : null;
  });

  const handleStep1Success = (data: {
    email: string;
    resendAvailableInSeconds: number;
  }) => {
    setSavedEmail(data.email);
    const session = savePendingPasswordReset({
      email: data.email,
      resendAvailableInSeconds: data.resendAvailableInSeconds,
    });
    setStepPayload(session);
  };

  const handleBack = () => {
    clearPendingPasswordReset();
    setStepPayload(null);
  };

  const handleSessionExpired = () => {
    clearPendingPasswordReset();
    setStepPayload(null);
  };

  if (stepPayload) {
    return (
      <ResetPasswordStep
        payload={stepPayload}
        onBack={handleBack}
        onSessionExpired={handleSessionExpired}
      />
    );
  }

  return (
    <ForgotPasswordForm
      onSuccess={handleStep1Success}
      initialEmail={savedEmail || undefined}
    />
  );
}
