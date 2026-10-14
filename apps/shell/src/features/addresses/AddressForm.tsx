import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, TextField } from "@ecom/ui";
import { addressFormSchema, type AddressFormData } from "./schemas.ts";
import {
  useProvincesQuery,
  useWardsQuery,
} from "@/hooks/queries/useLocationsQuery.ts";
import {
  useCreateAddressMutation,
  useUpdateAddressMutation,
} from "@/hooks/mutations/useAddressMutations.ts";
import type { Address } from "@/types";

export interface AddressFormProps {
  initialData?: Address | null;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export function AddressForm({
  initialData,
  onClose,
  onSubmitSuccess,
}: AddressFormProps) {
  const isEditing = Boolean(initialData);

  const createMutation = useCreateAddressMutation();
  const updateMutation = useUpdateAddressMutation();

  const { data: provinces = [], isLoading: isProvincesLoading } =
    useProvincesQuery();

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressFormSchema),
    mode: "onTouched",
    defaultValues: {
      label: initialData?.label || "",
      recipientName: initialData?.recipientName || "",
      phone: initialData?.phone || "",
      provinceCode: initialData?.provinceCode || "",
      wardCode: initialData?.wardCode || "",
      street: initialData?.street || "",
      isDefault: initialData?.isDefault ?? false,
    },
  });

  const selectedProvinceCode = useWatch({ control, name: "provinceCode" });

  const { data: wards = [], isLoading: isWardsLoading } =
    useWardsQuery(selectedProvinceCode);

  const provinceRegister = register("provinceCode");

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    provinceRegister.onChange(e);
    setValue("wardCode", "");
  };

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && initialData) {
        await updateMutation.mutateAsync({
          id: initialData.id,
          payload: {
            label: data.label?.trim() ? data.label.trim() : null,
            recipientName: data.recipientName.trim(),
            phone: data.phone.trim(),
            wardCode: data.wardCode,
            street: data.street.trim(),
            isDefault: data.isDefault,
          },
        });
      } else {
        await createMutation.mutateAsync({
          label: data.label?.trim() ? data.label.trim() : null,
          recipientName: data.recipientName.trim(),
          phone: data.phone.trim(),
          wardCode: data.wardCode,
          street: data.street.trim(),
          isDefault: data.isDefault,
        });
      }
      onSubmitSuccess();
    } catch {
      // Backend error is intercepted by api.onError and displayed as toast
    }
  };

  const isSaving =
    createMutation.isPending || updateMutation.isPending || isSubmitting;

  return (
    <section aria-labelledby="form-address-title">
      <Card className="p-6 sm:p-8 flex flex-col gap-5 bg-white border-2 border-brand/50 shadow-sm animate-in fade-in duration-200">
        <h2 id="form-address-title" className="text-[22px] font-bold text-ink">
          {isEditing ? "Sửa địa chỉ" : "Địa chỉ mới"}
        </h2>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="flex flex-col gap-5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên gợi nhớ */}
            <TextField
              label="Tên gợi nhớ (không bắt buộc)"
              placeholder="Nhà, Công ty…"
              autoComplete="off"
              error={errors.label?.message}
              {...register("label")}
            />

            {/* Họ và tên người nhận */}
            <TextField
              label="Họ và tên người nhận"
              placeholder="Nguyễn Văn A…"
              autoComplete="name"
              error={errors.recipientName?.message}
              {...register("recipientName")}
            />

            {/* Số điện thoại */}
            <TextField
              label="Số điện thoại"
              type="tel"
              placeholder="0901 234 567"
              autoComplete="tel"
              inputMode="tel"
              error={errors.phone?.message}
              {...register("phone")}
            />

            {/* Tỉnh, thành phố */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="select-province"
                className="text-sm font-semibold text-ink"
              >
                Tỉnh, thành phố
              </label>
              <select
                id="select-province"
                className="w-full min-h-[46px] px-3.5 rounded-control border border-field-border bg-white text-[15px] text-ink focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25 disabled:bg-canvas disabled:text-muted cursor-pointer transition-colors"
                aria-invalid={errors.provinceCode ? true : undefined}
                {...provinceRegister}
                onChange={handleProvinceChange}
              >
                <option value="">
                  {isProvincesLoading
                    ? "Đang tải tỉnh, thành phố..."
                    : "Chọn tỉnh, thành phố"}
                </option>
                {provinces.map((p) => (
                  <option key={p.code} value={p.code}>
                    {p.fullName || p.name}
                  </option>
                ))}
              </select>
              {errors.provinceCode?.message && (
                <p
                  className="text-[13px] font-medium text-err"
                  aria-live="polite"
                >
                  {errors.provinceCode.message}
                </p>
              )}
            </div>

            {/* Phường, xã */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="select-ward"
                className="text-sm font-semibold text-ink"
              >
                Phường, xã
              </label>
              <select
                id="select-ward"
                disabled={!selectedProvinceCode || isWardsLoading}
                className="w-full min-h-[46px] px-3.5 rounded-control border border-field-border bg-white text-[15px] text-ink focus-visible:outline-none focus-visible:border-brand focus-visible:ring-3 focus-visible:ring-brand/25 disabled:bg-canvas disabled:text-muted cursor-pointer transition-colors"
                aria-invalid={errors.wardCode ? true : undefined}
                {...register("wardCode")}
              >
                <option value="">
                  {!selectedProvinceCode
                    ? "Vui lòng chọn tỉnh, thành phố trước"
                    : isWardsLoading
                      ? "Đang tải phường, xã..."
                      : "Chọn phường, xã"}
                </option>
                {wards.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.fullName || w.name}
                  </option>
                ))}
              </select>
              {errors.wardCode?.message && (
                <p
                  className="text-[13px] font-medium text-err"
                  aria-live="polite"
                >
                  {errors.wardCode.message}
                </p>
              )}
            </div>

            {/* Số nhà, tên đường */}
            <TextField
              label="Số nhà, tên đường"
              placeholder="12 Đường Thử…"
              autoComplete="street-address"
              error={errors.street?.message}
              {...register("street")}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={isSaving}
              disabled={isSaving}
            >
              Lưu địa chỉ
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={onClose}
              disabled={isSaving}
            >
              Huỷ
            </Button>
          </div>
        </form>
      </Card>
    </section>
  );
}
