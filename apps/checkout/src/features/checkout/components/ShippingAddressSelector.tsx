import { Tag } from "@ecom/ui";
import type { Address, Province, Ward } from "@/types";
import { NewAddressForm, type NewAddressFormData } from "./NewAddressForm.tsx";

export interface ShippingAddressSelectorProps {
  addresses: Address[];
  selectedAddressId: string | "new";
  onSelectAddress: (id: string | "new") => void;
  newAddressData: NewAddressFormData;
  onChangeNewAddress: (patch: Partial<NewAddressFormData>) => void;
  provinces: Province[];
  wards: Ward[];
  isLoadingWards?: boolean;
}

export function ShippingAddressSelector({
  addresses,
  selectedAddressId,
  onSelectAddress,
  newAddressData,
  onChangeNewAddress,
  provinces,
  wards,
  isLoadingWards,
}: ShippingAddressSelectorProps) {
  const isNew = selectedAddressId === "new";

  return (
    <section
      aria-labelledby="addr-title"
      className="bg-canvas border border-line rounded-2xl p-6 flex flex-col gap-4 shadow-sm"
    >
      <h2 id="addr-title" className="font-head text-xl font-bold text-ink">
        Địa chỉ giao hàng
      </h2>

      <fieldset className="border-0 m-0 p-0 flex flex-col gap-3">
        <legend className="sr-only">Chọn địa chỉ giao hàng</legend>

        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id;
          const fullAddress = `${address.street}, ${address.wardName}, ${address.provinceName}`;

          return (
            <label
              key={address.id}
              className={`flex gap-3.5 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
                isSelected
                  ? "border-brand bg-brand-tint/20 ring-1 ring-brand"
                  : "border-line bg-canvas hover:border-ink/50"
              }`}
            >
              <input
                type="radio"
                name="shipping_address"
                checked={isSelected}
                onChange={() => onSelectAddress(address.id)}
                className="size-5 mt-0.5 accent-brand flex-none cursor-pointer"
              />
              <span className="flex flex-col gap-1 text-sm">
                <span className="font-semibold text-ink flex items-center gap-2">
                  {address.label || "Địa chỉ"}
                  {address.isDefault && (
                    <Tag tone="brand" className="text-xs">
                      Mặc định
                    </Tag>
                  )}
                </span>
                <span className="text-ink">
                  {address.recipientName},{" "}
                  <span className="font-mono text-muted">{address.phone}</span>
                </span>
                <span className="text-muted">{fullAddress}</span>
              </span>
            </label>
          );
        })}

        {/* Option: Giao tới địa chỉ khác */}
        <label
          className={`flex gap-3.5 items-start p-4 rounded-xl border cursor-pointer transition-colors ${
            isNew
              ? "border-brand bg-brand-tint/20 ring-1 ring-brand"
              : "border-line bg-canvas hover:border-ink/50"
          }`}
        >
          <input
            type="radio"
            name="shipping_address"
            checked={isNew}
            onChange={() => onSelectAddress("new")}
            className="size-5 mt-0.5 accent-brand flex-none cursor-pointer"
          />
          <span className="font-semibold text-ink text-sm">
            Giao tới địa chỉ khác
          </span>
        </label>
      </fieldset>

      {/* Form for new address */}
      {isNew && (
        <div className="border-t border-line pt-4">
          <NewAddressForm
            formData={newAddressData}
            onChange={onChangeNewAddress}
            provinces={provinces}
            wards={wards}
            isLoadingWards={isLoadingWards}
          />
        </div>
      )}
    </section>
  );
}
