import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { queryKeys } from "@/constants/queryKeys.ts";
import {
  useCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useAddToCartMutation,
  useVouchersQuery,
  useVoucherPreviewQuery,
  useSelectedVoucher,
} from "@/features/cart/hooks";
import {
  CartSkeleton,
  CartEmptyState,
  CartItemList,
  CartOrderSummary,
  type CartVoucherView,
} from "@/features/cart/components";
import { formatCartHeaderCount } from "@/features/cart/utils/cart-format.ts";

export function CartPage() {
  const { data: cart, isLoading, isGuest } = useCartQuery();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const addMutation = useAddToCartMutation();

  const queryClient = useQueryClient();
  const { select, clear } = useSelectedVoucher();

  const lineCount = cart?.lineCount ?? 0;
  const quantityCount = cart?.quantityCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  // Vouchers are for a signed-in customer with something in the cart. The list is only asked for
  // when the box is first opened; the chosen code is checked by the server (the page works out
  // nothing itself).
  const canUseVouchers = !isGuest && !isLoading && lineCount > 0;
  const [listWanted, setListWanted] = useState(false);
  const vouchersQuery = useVouchersQuery(canUseVouchers && listWanted);
  const voucherPreview = useVoucherPreviewQuery(canUseVouchers);

  const handleSelectVoucher = useCallback(
    (code: string) => {
      select(code);
      // Typing the same code again asks again (it is how a customer retries after a temporary failure)
      void queryClient.invalidateQueries({
        queryKey: queryKeys.cart.voucherPreview(code.trim()),
      });
    },
    [select, queryClient],
  );

  const voucher: CartVoucherView = {
    appliedCode: voucherPreview.code,
    preview: voucherPreview.preview,
    isChecking: voucherPreview.isFetching,
    errorMessage: voucherPreview.errorMessage,
    vouchers: vouchersQuery.data ?? [],
    listState: vouchersQuery.isError
      ? "error"
      : vouchersQuery.isPending
        ? "loading"
        : "ready",
    onOpenList: () => setListWanted(true),
    onSelect: handleSelectVoucher,
    onRemove: clear,
  };

  const handleUpdateQuantity = useCallback(
    (skuId: string, quantity: number) => {
      updateMutation.mutate({ skuId, quantity });
    },
    [updateMutation],
  );

  const handleRemove = useCallback(
    (skuId: string) => {
      const itemToRemove = cart?.items.find((i) => i.skuId === skuId) ?? null;
      removeMutation.mutate(
        { skuId },
        {
          onSuccess: () => {
            if (itemToRemove) {
              toast(`Đã xoá ${itemToRemove.productName || "sản phẩm"}`, {
                action: {
                  label: "Hoàn tác",
                  onClick: () => {
                    addMutation.mutate({
                      skuId: itemToRemove.skuId,
                      quantity: itemToRemove.quantity,
                      item: {
                        skuId: itemToRemove.skuId,
                        productId: itemToRemove.productId,
                        productName: itemToRemove.productName || "Sản phẩm",
                        thumbnail: itemToRemove.thumbnail,
                        attributes: itemToRemove.attributes,
                        price: itemToRemove.price ?? itemToRemove.addedPrice,
                        addedPrice: itemToRemove.addedPrice,
                        available: itemToRemove.available,
                        quantity: itemToRemove.quantity,
                      },
                    });
                  },
                },
              });
            }
          },
        },
      );
    },
    [cart?.items, removeMutation, addMutation],
  );

  if (isLoading) {
    return <CartSkeleton />;
  }

  const items = cart?.items ?? [];
  const isEmpty = items.length === 0;

  return (
    <div
      data-testid="cart-page"
      className="max-w-[1280px] mx-auto px-4 sm:px-10 py-8 pb-18 font-body text-ink"
    >
      <h1 className="font-head font-bold text-[32px] sm:text-[40px] tracking-tight text-ink mb-2">
        Giỏ hàng
      </h1>
      <p className="tnum text-muted text-[15px] mb-7" aria-live="polite">
        {formatCartHeaderCount(lineCount, quantityCount)}
      </p>

      {isEmpty ? (
        <CartEmptyState />
      ) : (
        <div className="flex gap-10 flex-wrap lg:flex-nowrap items-start">
          <CartItemList
            items={items}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            disabled={updateMutation.isPending || removeMutation.isPending}
          />
          <CartOrderSummary
            subtotal={subtotal}
            voucher={voucher}
            isGuest={isGuest}
          />
        </div>
      )}
    </div>
  );
}

export default CartPage;
