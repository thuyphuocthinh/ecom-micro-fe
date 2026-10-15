import { useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, Button, TextField, Dropdown } from "@ecom/ui";
import { addressFormSchema, type AddressFormData } from "./schemas.ts";
import {
  useProvincesQuery,
  useWardsQuery,
} from "@/features/addresses/hooks/useLocationsQuery.ts";
import {
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useSetDefaultAddressMutation,
} from "@/features/addresses/hooks/useAddressMutations.ts";
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
  const setDefaultMutation = useSetDefaultAddressMutation();

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
  const selectedWardCode = useWatch({ control, name: "wardCode" });

  const { data: wards = [], isLoading: isWardsLoading } =
    useWardsQuery(selectedProvinceCode);

  const provinceOptions = useMemo(
    () =>
      provinces.map((p) => ({
        value: p.code,
        label: p.fullName || p.name,
      })),
    [provinces],
  );

  const wardOptions = useMemo(
    () =>
      wards.map((w) => ({
        value: w.code,
        label: w.fullName || w.name,
      })),
    [wards],
  );

  const onSubmit = async (data: AddressFormData) => {
    try {
      if (isEditing && initialData) {
        // PATCH /users/me/addresses/:id does not accept isDefault in payload
        await updateMutation.mutateAsync({
          id: initialData.id,
          payload: {
            label: data.label?.trim() ? data.label.trim() : null,
            recipientName: data.recipientName.trim(),
            phone: data.phone.trim(),
            wardCode: data.wardCode,
            street: data.street.trim(),
          },
        });

        // If user set this address to default, call PUT /users/me/addresses/:id/default
        if (data.isDefault && !initialData.isDefault) {
          await setDefaultMutation.mutateAsync(initialData.id);
        }
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
    createMutation.isPending ||
    updateMutation.isPending ||
    setDefaultMutation.isPending ||
    isSubmitting;

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

            {/* Tỉnh, thành phố searchable Dropdown */}
            <Dropdown
              label="Tỉnh, thành phố"
              options={provinceOptions}
              value={selectedProvinceCode || ""}
              onChange={(val) => {
                setValue("provinceCode", val, { shouldValidate: true });
                setValue("wardCode", "", { shouldValidate: true });
              }}
              placeholder={
                isProvincesLoading
                  ? "Đang tải tỉnh, thành phố..."
                  : "Chọn tỉnh, thành phố"
              }
              searchable={true}
              searchPlaceholder="Tìm kiếm tỉnh, thành phố..."
              error={errors.provinceCode?.message}
            />

            {/* Phường, xã searchable Dropdown */}
            <Dropdown
              label="Phường, xã"
              options={wardOptions}
              value={selectedWardCode || ""}
              onChange={(val) => {
                setValue("wardCode", val, { shouldValidate: true });
              }}
              disabled={!selectedProvinceCode || isWardsLoading}
              placeholder={
                !selectedProvinceCode
                  ? "Vui lòng chọn tỉnh, thành phố trước"
                  : isWardsLoading
                    ? "Đang tải phường, xã..."
                    : "Chọn phường, xã"
              }
              searchable={true}
              searchPlaceholder="Tìm kiếm phường, xã..."
              error={errors.wardCode?.message}
            />

            {/* Số nhà, tên đường */}
            <TextField
              label="Số nhà, tên đường"
              placeholder="12 Đường Thử…"
              autoComplete="street-address"
              error={errors.street?.message}
              {...register("street")}
            />
          </div>

          {/* Đặt làm mặc định */}
          <label className="flex items-center gap-2.5 text-sm font-medium text-ink cursor-pointer select-none">
            <input
              type="checkbox"
              className="size-4.5 rounded text-brand focus:ring-brand accent-brand cursor-pointer disabled:cursor-not-allowed"
              disabled={initialData?.isDefault || isSaving}
              {...register("isDefault")}
            />
            <span>
              Đặt làm địa chỉ mặc định
              {initialData?.isDefault && (
                <span className="text-muted text-xs ml-1 font-normal">
                  (Đây là địa chỉ mặc định)
                </span>
              )}
            </span>
          </label>

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
