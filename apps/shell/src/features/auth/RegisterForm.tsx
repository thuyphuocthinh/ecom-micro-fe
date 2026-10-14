import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { Button, TextField, PasswordField } from "@ecom/ui";
import { api } from "@ecom/api";
import { registerFormSchema, type RegisterFormData } from "./schemas.ts";

export interface RegisterStep1SuccessPayload {
  displayName: string;
  email: string;
  password: string;
  resendAvailableInSeconds: number;
  verificationExpiresInSeconds: number;
}

export function RegisterForm({
  onSuccess,
  initialValues,
}: {
  onSuccess: (payload: RegisterStep1SuccessPayload) => void;
  initialValues?: { displayName?: string; email?: string };
}) {
  const [searchParams] = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
    mode: "onTouched",
    defaultValues: {
      displayName: initialValues?.displayName || "",
      email: initialValues?.email || "",
      password: "",
      termsAccepted: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      const res = await api.post("/auth/register", {
        body: {
          displayName: data.displayName,
          email: data.email,
          password: data.password,
        },
      });

      const resData = (res.data || {}) as {
        resendAvailableInSeconds?: number;
        verificationExpiresInSeconds?: number;
      };

      onSuccess({
        displayName: data.displayName,
        email: data.email,
        password: data.password,
        resendAvailableInSeconds: resData.resendAvailableInSeconds ?? 60,
        verificationExpiresInSeconds:
          resData.verificationExpiresInSeconds ?? 900,
      });
    } catch {
      // Backend error toast handled via api.onError
    }
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Đăng ký
        </h1>
        <p className="text-ink-2 text-[15px]">
          Đã có tài khoản?{" "}
          <Link
            to={
              rawReturnTo
                ? `/login?returnTo=${encodeURIComponent(rawReturnTo)}`
                : "/login"
            }
            className="text-brand font-semibold underline underline-offset-3 hover:text-brand-dark"
          >
            Đăng nhập
          </Link>
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-4.5"
      >
        <TextField
          id="name"
          label="Họ và tên"
          autoComplete="name"
          placeholder="Nguyễn Văn A…"
          error={errors.displayName?.message}
          {...register("displayName")}
        />

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

        <PasswordField
          id="password"
          label="Mật khẩu"
          autoComplete="new-password"
          placeholder="Ít nhất 8 ký tự…"
          hint="8 đến 128 ký tự, tránh mật khẩu quá phổ biến"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex flex-col gap-1.5 pt-1">
          <label className="flex items-start gap-3 min-h-11 cursor-pointer select-none">
            <input
              id="terms"
              type="checkbox"
              aria-describedby="terms-error"
              aria-invalid={errors.termsAccepted ? true : undefined}
              className="size-5 mt-0.5 rounded accent-brand flex-none cursor-pointer"
              {...register("termsAccepted")}
            />
            <span className="text-sm text-ink-2 leading-relaxed">
              Tôi đồng ý với{" "}
              <span className="text-brand font-semibold underline underline-offset-3">
                điều khoản sử dụng
              </span>{" "}
              và{" "}
              <span className="text-brand font-semibold underline underline-offset-3">
                chính sách bảo mật
              </span>
              .
            </span>
          </label>
          <p
            id="terms-error"
            aria-live="polite"
            className="text-[13px] font-medium text-err"
          >
            {errors.termsAccepted?.message}
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full mt-2"
        >
          {isSubmitting ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
        </Button>
      </form>
    </div>
  );
}
