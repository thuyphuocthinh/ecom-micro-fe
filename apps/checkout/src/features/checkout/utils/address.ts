export interface NewAddressFormData {
  recipientName: string;
  phone: string;
  provinceCode: string;
  wardCode: string;
  street: string;
}

export function isNewAddressFormComplete(
  formData: NewAddressFormData,
): boolean {
  return Boolean(
    formData.recipientName.trim() &&
    formData.phone.trim() &&
    formData.provinceCode &&
    formData.wardCode &&
    formData.street.trim(),
  );
}
