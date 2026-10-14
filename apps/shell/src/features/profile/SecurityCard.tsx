import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, PasswordField } from "@ecom/ui";
import { useAuth } from "@/features/auth";
import { Icon } from "@/components/common/Icon.tsx";
import {
  changePasswordSchema,
  type ChangePasswordFormData,
} from "./schemas.ts";
import { useChangePasswordMutation } from "@/hooks/mutations/useChangePasswordMutation.ts";

export function SecurityCard() {
  const { user } = useAuth();
  const changePasswordMutation = useChangePasswordMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onTouched",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      reset();
    } catch {
      // Backend error is intercepted by api.onError and displayed as toast
    }
  };

  return (
    <section aria-labelledby="pw-title">
      <Card className="p-6 sm:p-8 flex flex-col gap-6 bg-white">
        {/* Header matching ecom-storefront.html */}
        <div className="flex items-center justify-between pb-2 border-b border-line">
          <h2
            id="pw-title"
            className="text-[22px] font-bold text-ink flex items-center gap-3"
          >
            <span
              className="size-11 rounded-[12px] bg-[#fff3d6] text-[#8a5a00] inline-flex items-center justify-center shrink-0"
              aria-hidden="true"
            >
              <Icon name="lock" size={24} />
            </span>
            <span>Đổi mật khẩu</span>
          </h2>
        </div>

        {user?.hasPassword === false ? (
          // Google account notice
          <div className="flex items-start gap-3.5 p-4 rounded-xl bg-canvas border border-line text-ink">
            <span className="size-8 rounded-lg bg-ok-tint text-ok inline-flex items-center justify-center shrink-0 mt-0.5">
              <Icon name="check" size={18} />
            </span>
            <div className="flex flex-col gap-1 text-[14px]">
              <p className="font-semibold text-ink">
                Tài khoản bảo mật qua Google
              </p>
              <p className="text-muted leading-relaxed">
                Tài khoản của bạn được liên kết và đăng nhập an toàn qua Google.
                Không cần tạo hoặc đổi mật khẩu trên hệ thống.
              </p>
            </div>
          </div>
        ) : (
          // Password change form
          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="flex flex-col gap-4 max-w-[420px]"
          >
            <PasswordField
              label="Mật khẩu hiện tại"
              autoComplete="current-password"
              error={errors.currentPassword?.message}
              {...register("currentPassword")}
            />

            <PasswordField
              label="Mật khẩu mới"
              autoComplete="new-password"
              placeholder="Ít nhất 8 ký tự…"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <PasswordField
              label="Xác nhận mật khẩu mới"
              autoComplete="new-password"
              placeholder="Nhập lại mật khẩu mới…"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <div className="pt-2">
              <Button
                type="submit"
                variant="secondary"
                size="md"
                loading={changePasswordMutation.isPending || isSubmitting}
                disabled={changePasswordMutation.isPending || isSubmitting}
              >
                Đổi mật khẩu
              </Button>
            </div>
          </form>
        )}
      </Card>
    </section>
  );
}
