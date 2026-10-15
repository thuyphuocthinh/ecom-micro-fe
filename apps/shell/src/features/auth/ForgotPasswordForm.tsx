import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { toast } from "sonner";
import { Button, TextField } from "@ecom/ui";
import { useForgotPasswordMutation } from "@/features/auth/hooks/useForgotPasswordMutation.ts";
import {
  forgotPasswordFormSchema,
  type ForgotPasswordFormData,
} from "./schemas.ts";

export interface ForgotPasswordFormProps {
  onSuccess: (data: {
    email: string;
    resendAvailableInSeconds: number;
  }) => void;
  initialEmail?: string;
}

export function ForgotPasswordForm({
  onSuccess,
  initialEmail,
}: ForgotPasswordFormProps) {
  const [searchParams] = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");

  const forgotPasswordMutation = useForgotPasswordMutation();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: initialEmail || "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      const resData = await forgotPasswordMutation.mutateAsync({
        email: data.email,
      });

      toast.success(
        "Mã xác minh đã được gửi tới email của bạn (nếu email tồn tại trên hệ thống).",
      );

      onSuccess({
        email: data.email,
        resendAvailableInSeconds: resData?.resendAvailableInSeconds ?? 300,
      });
    } catch {
      // Backend errors handled via api.onError
    }
  };

  const isLoading = isSubmitting || forgotPasswordMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Quên mật khẩu
        </h1>
        <p className="text-ink-2 text-[15px] leading-relaxed">
          Nhập địa chỉ email tài khoản của bạn để nhận mã xác nhận đặt lại mật
          khẩu.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4.5"
      >
        <TextField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="ban@vi-du.com"
          error={errors.email?.message}
          {...register("email")}
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? "Đang gửi…" : "Gửi mã xác nhận"}
        </Button>

        <div className="text-center pt-2">
          <Link
            to={
              rawReturnTo
                ? `/login?returnTo=${encodeURIComponent(rawReturnTo)}`
                : "/login"
            }
            className="text-sm font-semibold text-brand hover:text-brand-dark underline underline-offset-3"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </form>
    </div>
  );
}
