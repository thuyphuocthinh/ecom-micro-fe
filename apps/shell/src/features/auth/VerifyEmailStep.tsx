import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button, CodeInput } from "@ecom/ui";
import { api, ApiError } from "@ecom/api";
import { verifyEmailFormSchema, type VerifyEmailFormData } from "./schemas.ts";
import { useAuth } from "./auth-context.ts";
import { sanitizeReturnTo } from "../../utils/redirect.ts";
import type { RegisterStep1SuccessPayload } from "./RegisterForm.tsx";

function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VerifyEmailStep({
  payload,
  onBack,
  onSessionExpired,
}: {
  payload: RegisterStep1SuccessPayload;
  onBack: () => void;
  onSessionExpired: () => void;
}) {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = sanitizeReturnTo(searchParams.get("returnTo"));

  const [countdown, setCountdown] = useState(payload.resendAvailableInSeconds);
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

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
      const res = await api.post("/auth/verify-email", {
        body: {
          email: payload.email,
          code: data.code,
          password: payload.password,
        },
      });

      await login(res.data);
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
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    try {
      const res = await api.post("/auth/resend-verification", {
        body: {
          email: payload.email,
        },
      });
      toast.success("Đã gửi mã mới");
      const nextSeconds =
        (res.data as { resendAvailableInSeconds?: number })
          ?.resendAvailableInSeconds ?? 60;
      setCountdown(nextSeconds);
    } catch (err) {
      if (
        err instanceof ApiError &&
        (err.code === "AUTH-009" || err.code === "AUTH-011")
      ) {
        onSessionExpired();
      }
    } finally {
      setIsResending(false);
    }
  };

  const expireMinutes = Math.ceil(payload.verificationExpiresInSeconds / 60);

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
            disabled={countdown > 0 || isResending}
            onClick={handleResend}
            className="text-sm font-semibold text-muted disabled:opacity-60 disabled:cursor-not-allowed hover:text-ink transition-colors cursor-pointer"
          >
            {countdown > 0
              ? `Gửi lại sau ${formatSeconds(countdown)}`
              : isResending
                ? "Đang gửi…"
                : "Gửi lại mã"}
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Đang xác minh…" : "Xác minh"}
        </Button>
      </form>
    </div>
  );
}
