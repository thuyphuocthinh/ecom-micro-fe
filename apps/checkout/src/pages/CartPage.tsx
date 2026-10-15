import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  useCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useAddToCartMutation,
} from "@/features/cart/hooks";
import {
  CartSkeleton,
  CartEmptyState,
  CartItemList,
  CartOrderSummary,
} from "@/features/cart/components";
import { formatCartHeaderCount } from "@/features/cart/utils/cart-format.ts";

export function CartPage() {
  const { data: cart, isLoading, isGuest } = useCartQuery();
  const updateMutation = useUpdateCartItemMutation();
  const removeMutation = useRemoveCartItemMutation();
  const addMutation = useAddToCartMutation();

  const [couponCode, setCouponCode] = useState<string>("");

  const lineCount = cart?.lineCount ?? 0;
  const quantityCount = cart?.quantityCount ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  // Coupon discount computation
  const isCouponValid = couponCode === "ECOM50K" && subtotal > 0;
  const discountAmount = isCouponValid ? 50000 : 0;

  const handleApplyCoupon = useCallback(
    (code: string): boolean => {
      if (code === "ECOM50K" && subtotal > 0) {
        setCouponCode("ECOM50K");
        return true;
      }
      setCouponCode("");
      return false;
    },
    [subtotal],
  );

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
            couponCode={couponCode}
            discountAmount={discountAmount}
            onApplyCoupon={handleApplyCoupon}
            isGuest={isGuest}
          />
        </div>
      )}
    </div>
  );
}

export default CartPage;
