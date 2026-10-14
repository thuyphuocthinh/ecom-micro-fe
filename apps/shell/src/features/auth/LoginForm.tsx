import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearchParams } from "react-router";
import { Button, TextField, PasswordField } from "@ecom/ui";
import { useLoginMutation } from "@/hooks/mutations/useLoginMutation.ts";
import { loginFormSchema, type LoginFormData } from "./schemas.ts";
import { sanitizeReturnTo } from "@/utils/redirect.ts";
import { GoogleAuthButton } from "./GoogleAuthButton.tsx";

export function LoginForm() {
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawReturnTo = searchParams.get("returnTo");
  const returnTo = sanitizeReturnTo(rawReturnTo);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await loginMutation.mutateAsync({
        email: data.email,
        password: data.password,
      });

      navigate(returnTo, { replace: true });
    } catch {
      // Backend errors are handled centrally via api.onError (ToastHost)
      // Form fields only display Zod errors (AC-4)
    }
  };

  const isLoading = isSubmitting || loginMutation.isPending;

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink">
          Đăng nhập
        </h1>
        <p className="text-ink-2 text-[15px]">
          Chưa có tài khoản?{" "}
          <Link
            to={
              rawReturnTo
                ? `/register?returnTo=${encodeURIComponent(rawReturnTo)}`
                : "/register"
            }
            className="text-brand font-semibold underline underline-offset-3 hover:text-brand-dark"
          >
            Đăng ký miễn phí
          </Link>
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

        <PasswordField
          id="password"
          label="Mật khẩu"
          autoComplete="current-password"
          placeholder="Nhập mật khẩu…"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-end -mt-1">
          <Link
            to={
              rawReturnTo
                ? `/forgot-password?returnTo=${encodeURIComponent(rawReturnTo)}`
                : "/forgot-password"
            }
            className="text-sm font-semibold text-brand hover:text-brand-dark underline underline-offset-3"
          >
            Quên mật khẩu?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isLoading}
          className="w-full mt-2"
        >
          {isLoading ? "Đang đăng nhập…" : "Đăng nhập"}
        </Button>
      </form>

      <div className="relative my-1 flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-line" />
        </div>
        <div className="relative bg-surface px-4 text-xs uppercase tracking-wider text-ink-3">
          Hoặc
        </div>
      </div>

      <GoogleAuthButton returnTo={rawReturnTo} context="signin" />
    </div>
  );
}
