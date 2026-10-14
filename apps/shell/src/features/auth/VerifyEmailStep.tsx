import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button, CodeInput } from "@ecom/ui";
import { ApiError } from "@ecom/api";
import { useCountdown } from "../../hooks/common/useCountdown.ts";
import { useVerifyEmailMutation } from "../../hooks/mutations/useVerifyEmailMutation.ts";
import { useResendCodeMutation } from "../../hooks/mutations/useResendCodeMutation.ts";
import {
  formatDurationMmSs,
  secondsToMinutesCeil,
} from "../../utils/format.ts";
import { sanitizeReturnTo } from "../../utils/redirect.ts";
import { verifyEmailFormSchema, type VerifyEmailFormData } from "./schemas.ts";
import type { RegisterStep1SuccessPayload } from "./RegisterForm.tsx";

export function VerifyEmailStep({
  payload,
  onBack,
  onSessionExpired,
}: {
  payload: RegisterStep1SuccessPayload;
  onBack: () => void;
  onSessionExpired: () => void;
}) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const { countdown, isRunning, resetCountdown } = useCountdown(
    payload.resendAvailableInSeconds,
  );

  const verifyEmailMutation = useVerifyEmailMutation();
  const resendCodeMutation = useResendCodeMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VerifyEmailFormData>({
    resolver: zodResolver(verifyEmailFormSchema),
    mode: "onTouched",
    defaultValues: {
      code: "",
    },
  });

  const onSubmit = async (data: VerifyEmailFormData) => {
    try {
      await verifyEmailMutation.mutateAsync({
        email: payload.email,
        code: data.code,
        password: payload.password,
      });

      toast.success(
        `Chào mừng, ${payload.displayName || "bạn"}! Tài khoản đã sẵn sàng.`,
      );
      navigate(returnTo, { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.code === "AUTH-011") {
        onSessionExpired();
      }
    }
  };

  const handleResend = async () => {
    if (isRunning || resendCodeMutation.isPending) return;
    try {
      const resData = await resendCodeMutation.mutateAsync({
        email: payload.email,
      });
      toast.success("Đã gửi mã mới");
      resetCountdown(resData.resendAvailableInSeconds ?? 60);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === "AUTH-009" || err.code === "AUTH-011")
      ) {
        onSessionExpired();
      }
    }
  };

  const expireMinutes = secondsToMinutesCeil(
    payload.verificationExpiresInSeconds,
  );
  const isVerifying = isSubmitting || verifyEmailMutation.isPending;
  const isResending = resendCodeMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Xác minh email
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
          loading={isVerifying}
          className="w-full mt-2"
        >
          {isVerifying ? "Đang xác minh…" : "Xác minh"}
        </Button>
      </form>
    </div>
  );
}
