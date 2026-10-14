import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authService } from "@/services/auth.service.ts";
import type { ChangePasswordPayload } from "@/types";

export function useChangePasswordMutation() {
  return useMutation({
    mutationFn: (data: ChangePasswordPayload) =>
      authService.changePassword(data),
    onSuccess: () => {
      toast.success(
        "Đã đổi mật khẩu. Các thiết bị khác sẽ phải đăng nhập lại.",
      );
    },
  });
}
