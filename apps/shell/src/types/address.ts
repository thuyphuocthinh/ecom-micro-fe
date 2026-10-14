export interface Address {
  id: string;
  recipientName: string;
  phone: string;
  provinceCode: string;
  provinceName: string;
  wardCode: string;
  wardName: string;
  street: string;
  label: string | null;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAddressPayload {
  recipientName: string;
  phone: string;
  wardCode: string;
  street: string;
  label?: string | null;
  isDefault?: boolean;
}

export interface UpdateAddressPayload {
  recipientName?: string;
  phone?: string;
  wardCode?: string;
  street?: string;
  label?: string | null;
}
