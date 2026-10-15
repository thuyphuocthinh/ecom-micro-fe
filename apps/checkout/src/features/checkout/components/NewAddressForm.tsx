import type { ChangeEvent } from "react";
import type { Province, Ward } from "@/types";
import {
  isNewAddressFormComplete,
  type NewAddressFormData,
} from "@/features/checkout/utils";

export type { NewAddressFormData };

export interface NewAddressFormProps {
  formData: NewAddressFormData;
  onChange: (patch: Partial<NewAddressFormData>) => void;
  provinces: Province[];
  wards: Ward[];
  isLoadingWards?: boolean;
}

export function NewAddressForm({
  formData,
  onChange,
  provinces,
  wards,
  isLoadingWards = false,
}: NewAddressFormProps) {
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleProvinceChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    onChange({
      provinceCode,
      wardCode: "", // reset ward when province changes
    });
  };

  const handleWardChange = (e: ChangeEvent<HTMLSelectElement>) => {
    onChange({ wardCode: e.target.value });
  };

  const isComplete = isNewAddressFormComplete(formData);

  return (
    <div className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Recipient Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="recipientName"
            className="text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Họ và tên người nhận
          </label>
          <input
            id="recipientName"
            name="recipientName"
            type="text"
            autoComplete="name"
            placeholder="Nguyễn Văn A…"
            value={formData.recipientName}
            onChange={handleInputChange}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>

        {/* Phone */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="phone"
            className="text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Số điện thoại
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="0901 234 567"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>

        {/* Province */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="province"
            className="text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Tỉnh, thành phố
          </label>
          <select
            id="province"
            name="provinceCode"
            autoComplete="address-level1"
            value={formData.provinceCode}
            onChange={handleProvinceChange}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          >
            <option value="">Chọn tỉnh, thành phố</option>
            {provinces.map((p) => (
              <option key={p.code} value={p.code}>
                {p.fullName || p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="ward"
            className="text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Phường, xã
          </label>
          <select
            id="ward"
            name="wardCode"
            autoComplete="address-level2"
            value={formData.wardCode}
            onChange={handleWardChange}
            disabled={!formData.provinceCode || isLoadingWards}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-line bg-canvas text-ink text-sm disabled:opacity-50 disabled:bg-surface-sunken focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          >
            <option value="">
              {isLoadingWards ? "Đang tải…" : "Chọn phường, xã"}
            </option>
            {wards.map((w) => (
              <option key={w.code} value={w.code}>
                {w.fullName || w.name}
              </option>
            ))}
          </select>
        </div>

        {/* Street */}
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label
            htmlFor="street"
            className="text-xs font-semibold text-ink uppercase tracking-wider"
          >
            Số nhà, tên đường
          </label>
          <input
            id="street"
            name="street"
            type="text"
            autoComplete="address-line1"
            placeholder="12 Đường Thử…"
            value={formData.street}
            onChange={handleInputChange}
            className="w-full min-h-[46px] px-3.5 rounded-xl border border-line bg-canvas text-ink text-sm focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent transition"
          />
        </div>
      </div>

      {!isComplete && (
        <p className="text-xs text-muted" aria-live="polite">
          Điền đủ các ô trên để đặt hàng.
        </p>
      )}
    </div>
  );
}
