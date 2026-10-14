import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useSearchParams } from "react-router";
import { Button, TextField, PasswordField } from "@ecom/ui";
import { useRegisterMutation } from "../../hooks/mutations/useRegisterMutation.ts";
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
  const registerMutation = useRegisterMutation();
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
      const resData = await registerMutation.mutateAsync({
        displayName: data.displayName,
        email: data.email,
        password: data.password,
      });

      onSuccess({
        displayName: data.displayName,
        email: data.email,
        password: data.password,
        resendAvailableInSeconds: resData.resendAvailableInSeconds ?? 60,
        verificationExpiresInSeconds:
          resData.verificationExpiresInSeconds ?? 900,
      });
    } catch {
      // Backend errors are handled centrally via api.onError (ToastHost)
      // Form fields only display Zod errors (AC-4)
    }
  };

  const isLoading = isSubmitting || registerMutation.isPending;

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
          id="displayName"
          label="Họ và tên"
          type="text"
          autoComplete="name"
          placeholder="Nguyễn Văn A"
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
          <label className="flex items-start gap-2.5 cursor-pointer select-none text-[14.5px] text-ink leading-relaxed">
            <input
              type="checkbox"
              className="mt-1 size-4.5 rounded text-brand focus:ring-brand focus:ring-offset-2 border-line cursor-pointer"
              {...register("termsAccepted")}
            />
            <span>
              Tôi đồng ý với{" "}
              <Link
                to="/terms"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline underline-offset-2 hover:text-brand-dark"
              >
                Điều khoản dịch vụ
              </Link>{" "}
              và{" "}
              <Link
                to="/privacy"
                target="_blank"
                rel="noreferrer"
                className="text-brand underline underline-offset-2 hover:text-brand-dark"
              >
                Chính sách bảo mật
              </Link>
              .
            </span>
          </label>
          {errors.termsAccepted?.message && (
            <p role="alert" className="text-xs text-err font-medium pl-7">
              {errors.termsAccepted.message}
            </p>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? "Đang tạo tài khoản…" : "Tạo tài khoản"}
        </Button>
      </form>
    </div>
  );
}
