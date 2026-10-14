import { useState } from "react";
import { Button, Spinner } from "@ecom/ui";
import { Icon } from "@/components/common/Icon.tsx";
import {
  AddressCard,
  AddressForm,
  AddressEmptyState,
  DeleteAddressModal,
} from "@/features/addresses";
import { useAddressesQuery } from "@/hooks/queries/useAddressesQuery.ts";
import {
  useSetDefaultAddressMutation,
  useDeleteAddressMutation,
} from "@/hooks/mutations/useAddressMutations.ts";
import type { Address } from "@/types";

export function AddressesPage() {
  const { data: addresses = [], isLoading } = useAddressesQuery();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const setDefaultMutation = useSetDefaultAddressMutation();
  const deleteMutation = useDeleteAddressMutation();

  const count = addresses.length;
  const canAdd = count < 10;
  const countText = `Đã lưu ${count}/10 địa chỉ`;

  const handleOpenAddForm = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingAddress) return;
    try {
      await deleteMutation.mutateAsync(deletingAddress.id);
      setDeletingAddress(null);
    } catch {
      // Backend error is intercepted by api.onError
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header section matching ecom-storefront.html */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-1">
        <div>
          <h1 className="font-head text-3xl sm:text-4xl font-bold text-ink tracking-tight">
            Sổ địa chỉ
          </h1>
          <p
            className="tabular-nums text-[15px] text-muted mt-1.5"
            aria-live="polite"
          >
            {countText}
          </p>
        </div>

        {canAdd ? (
          !isFormOpen && (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenAddForm}
            >
              <Icon name="plus" size={18} />
              <span>Thêm địa chỉ mới</span>
            </Button>
          )
        ) : (
          <span className="text-sm font-medium text-warn self-start sm:self-auto py-2">
            Đã đạt giới hạn tối đa 10 địa chỉ
          </span>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center p-8">
          <Spinner className="size-8 text-brand" />
        </div>
      ) : (
        <>
          {/* Address Form (Add or Edit) */}
          {isFormOpen && (
            <AddressForm
              key={editingAddress ? `edit-${editingAddress.id}` : "add-new"}
              initialData={editingAddress}
              onClose={handleCloseForm}
              onSubmitSuccess={handleCloseForm}
            />
          )}

          {/* Empty state when 0 addresses and form is closed */}
          {count === 0 && !isFormOpen ? (
            <AddressEmptyState onAddFirst={handleOpenAddForm} />
          ) : (
            /* Address Cards Grid */
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 m-0 p-0 list-none">
              {addresses.map((address) => (
                <li key={address.id} className="h-full flex flex-col">
                  <AddressCard
                    address={address}
                    onEdit={handleOpenEditForm}
                    onDelete={(item) => setDeletingAddress(item)}
                    onSetDefault={(id) => setDefaultMutation.mutate(id)}
                    isSettingDefault={
                      setDefaultMutation.isPending &&
                      setDefaultMutation.variables === address.id
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteAddressModal
        open={Boolean(deletingAddress)}
        addressLabel={deletingAddress?.label || deletingAddress?.recipientName}
        onClose={() => setDeletingAddress(null)}
        onConfirm={handleDeleteConfirm}
        isDeleting={deleteMutation.isPending}
      />
    </div>
  );
}

export default AddressesPage;
