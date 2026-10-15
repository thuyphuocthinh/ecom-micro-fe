import { useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { GUEST_CART_STORAGE_KEY } from "@/utils/cart.ts";
import type { HomeProduct } from "@/features/home/types/home.ts";

export interface GuestCartItem {
  skuId: string;
  productId?: string | null;
  productName: string;
  thumbnail?: string | null;
  attributes?: Record<string, string> | null;
  price: number;
  addedPrice: number;
  available?: number | null;
  quantity: number;
  flags?: string[];
}

export function useHomeAddToCart() {
  const navigate = useNavigate();

  const addToCart = useCallback(
    (product: HomeProduct) => {
      try {
        let currentItems: GuestCartItem[] = [];
        if (typeof window !== "undefined") {
          const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) currentItems = parsed;
          }
        }

        const existingIndex = currentItems.findIndex(
          (i) => i.skuId === product.skuId,
        );

        let updated: GuestCartItem[];
        if (existingIndex >= 0) {
          const existing = currentItems[existingIndex];
          const newQty = Math.min((existing.quantity || 1) + 1, 99);
          updated = currentItems.map((item, idx) =>
            idx === existingIndex ? { ...item, quantity: newQty } : item,
          );
        } else {
          const newItem: GuestCartItem = {
            skuId: product.skuId,
            productId: product.id,
            productName: product.name,
            thumbnail: null,
            price: product.price,
            addedPrice: product.price,
            quantity: 1,
          };
          updated = [newItem, ...currentItems];
        }

        if (typeof window !== "undefined") {
          localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updated));
          window.dispatchEvent(new CustomEvent("cart:changed"));
        }

        toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
          action: {
            label: "Xem giỏ hàng",
            onClick: () => navigate("/cart"),
          },
        });
      } catch {
        toast.error("Không thể thêm vào giỏ hàng lúc này. Vui lòng thử lại!");
      }
    },
    [navigate],
  );

  return { addToCart };
}
