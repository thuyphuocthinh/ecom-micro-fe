import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { Button, CodeInput, PasswordField } from "@ecom/ui";
import { ApiError } from "@ecom/api";
import { useCountdown } from "@/hooks/common/useCountdown.ts";
import {
  useResetPasswordMutation,
  useForgotPasswordMutation,
} from "@/hooks/mutations";
import { formatDurationMmSs, secondsToMinutesCeil } from "@/utils/format.ts";
import {
  updatePendingPasswordResetResend,
  clearPendingPasswordReset,
} from "@/utils/pending-password-reset.ts";
import {
  resetPasswordFormSchema,
  type ResetPasswordFormData,
} from "./schemas.ts";
import type { PendingPasswordResetSession } from "@/types";

export type ResetPasswordStepPayload = PendingPasswordResetSession;

export interface ResetPasswordStepProps {
  payload: ResetPasswordStepPayload;
  onBack: () => void;
  onSessionExpired: () => void;
}

export function ResetPasswordStep({
  payload,
  onBack,
  onSessionExpired,
}: ResetPasswordStepProps) {
  const navigate = useNavigate();

  const { countdown, isRunning, resetCountdown } = useCountdown({
    targetTimestamp: payload.resendAvailableAt,
  });

  const resetPasswordMutation = useResetPasswordMutation();
  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordFormSchema),
    mode: "onTouched",
    defaultValues: {
      code: "",
      newPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    try {
      await resetPasswordMutation.mutateAsync({
        email: payload.email,
        code: data.code,
        newPassword: data.newPassword,
      });

      clearPendingPasswordReset();
      toast.success(
        "Đặt lại mật khẩu thành công! Vui lòng đăng nhập bằng mật khẩu mới.",
      );
      navigate("/login", { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "AUTH-008") {
        // Code expired or invalid
      }
    }
  };

  const handleResend = async () => {
    if (isRunning || forgotPasswordMutation.isPending) return;
    try {
      const resData = await forgotPasswordMutation.mutateAsync({
        email: payload.email,
      });
      toast.success("Đã gửi mã mới");
      const nextSeconds = resData?.resendAvailableInSeconds ?? 300;
      updatePendingPasswordResetResend(nextSeconds);
      resetCountdown(nextSeconds);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        clearPendingPasswordReset();
        onSessionExpired();
      }
    }
  };

  const [expireMinutes] = useState(() => {
    const expireSeconds = Math.max(
      0,
      Math.ceil((payload.expiresAt - Date.now()) / 1000),
    );
    return secondsToMinutesCeil(expireSeconds);
  });

  const isResetting = isSubmitting || resetPasswordMutation.isPending;
  const isResending = forgotPasswordMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Đặt lại mật khẩu
        </h1>
        <p className="text-ink-2 text-[15px] leading-relaxed">
          Chúng tôi đã gửi mã 6 số tới{" "}
          <strong className="text-ink font-semibold">{payload.email}</strong>.
          Mã sẽ hết hạn sau khoảng {expireMinutes} phút.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4.5"
      >
        <CodeInput
          id="code"
          label="Mã xác minh 6 chữ số"
          placeholder="••••••"
          error={errors.code?.message}
          {...register("code")}
        />

        <PasswordField
          id="newPassword"
          label="Mật khẩu mới"
          autoComplete="new-password"
          placeholder="Từ 8 đến 128 ký tự…"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />

        <div className="flex items-center justify-between gap-4 pt-1">
          <button
            type="button"
            onClick={onBack}
            className="text-sm font-semibold text-brand hover:text-brand-dark underline underline-offset-3 cursor-pointer"
          >
            Đổi email khác
          </button>

          <button
            type="button"
            disabled={isRunning || isResending}
            onClick={handleResend}
            className="text-sm font-semibold text-muted disabled:opacity-60 disabled:cursor-not-allowed hover:text-ink transition-colors cursor-pointer"
          >
            {isResending
              ? "Đang gửi…"
              : isRunning
                ? `Gửi lại sau ${formatDurationMmSs(countdown)}`
                : "Gửi lại mã"}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isResetting}
          className="w-full mt-2"
        >
          {isResetting ? "Đang đặt lại…" : "Đặt lại mật khẩu"}
        </Button>
      </form>
    </div>
  );
}
