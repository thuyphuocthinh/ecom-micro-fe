import { z } from "zod";

export const addressFormSchema = z.object({
  recipientName: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập họ và tên người nhận")
    .max(100, "Tối đa 100 ký tự"),
  phone: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số điện thoại")
    .regex(
      /^(0|\+84)[0-9]{9}$/,
      "Số điện thoại không hợp lệ (10 chữ số, bắt đầu bằng 0)",
    ),
  provinceCode: z.string().min(1, "Vui lòng chọn tỉnh, thành phố"),
  wardCode: z.string().min(1, "Vui lòng chọn phường, xã"),
  street: z
    .string()
    .trim()
    .min(1, "Vui lòng nhập số nhà, tên đường")
    .max(255, "Tối đa 255 ký tự"),
  label: z
    .string()
    .trim()
    .max(50, "Tên gợi nhớ tối đa 50 ký tự")
    .optional()
    .or(z.literal("")),
  isDefault: z.boolean().optional(),
});

export type AddressFormData = z.infer<typeof addressFormSchema>;
