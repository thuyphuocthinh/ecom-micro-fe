import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Nhập email của bạn.")
  .max(254, "Email chưa đúng dạng, ví dụ ban@vi-du.com.")
  .email("Email chưa đúng dạng, ví dụ ban@vi-du.com.");

export const loginPasswordSchema = z
  .string()
  .min(1, "Nhập mật khẩu.")
  .min(8, "Mật khẩu từ 8 đến 128 ký tự.")
  .max(128, "Mật khẩu từ 8 đến 128 ký tự.");

export const registerPasswordSchema = z
  .string()
  .min(1, "Nhập mật khẩu.")
  .min(8, "Mật khẩu từ 8 đến 128 ký tự.")
  .max(128, "Mật khẩu từ 8 đến 128 ký tự.");

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, "Nhập họ và tên của bạn.")
  .max(100, "Họ và tên tối đa 100 ký tự.");

export const termsSchema = z.boolean().refine((val) => val === true, {
  message: "Bạn cần đồng ý với điều khoản để tạo tài khoản.",
});

export const verifyCodeSchema = z
  .string()
  .regex(/^\d{6}$/, "Nhập đủ 6 chữ số.");

export const loginFormSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export type LoginFormData = z.infer<typeof loginFormSchema>;

export const registerFormSchema = z.object({
  displayName: displayNameSchema,
  email: emailSchema,
  password: registerPasswordSchema,
  termsAccepted: termsSchema,
});

export type RegisterFormData = z.infer<typeof registerFormSchema>;

export const verifyEmailFormSchema = z.object({
  code: verifyCodeSchema,
});

export type VerifyEmailFormData = z.infer<typeof verifyEmailFormSchema>;
