import { z } from "zod";

export const updateProfileSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Họ và tên không được để trống")
    .max(100, "Tối đa 100 ký tự"),
});

export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Nhập mật khẩu hiện tại."),
    newPassword: z
      .string()
      .min(8, "Mật khẩu mới cần ít nhất 8 ký tự.")
      .max(128, "Mật khẩu tối đa 128 ký tự."),
    confirmPassword: z.string().min(1, "Nhập lại mật khẩu mới."),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    path: ["newPassword"],
  })
  .refine((data) => data.confirmPassword === data.newPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
