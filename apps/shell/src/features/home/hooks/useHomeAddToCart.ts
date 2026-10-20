import { useCallback } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { ApiError, session } from "@ecom/api";
import { cartService } from "@/services/cart.service.ts";
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

/** A visitor who has not signed in keeps the cart in this browser; a signed-in customer's cart is on the server. */
function isSignedIn(): boolean {
  return Boolean(session.getAccessToken() || session.getRefreshToken());
}

function addToGuestCart(product: HomeProduct): void {
  let currentItems: GuestCartItem[] = [];
  const raw = localStorage.getItem(GUEST_CART_STORAGE_KEY);
  if (raw) {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) currentItems = parsed;
  }

  const existing = currentItems.find((i) => i.skuId === product.skuId);
  const updated: GuestCartItem[] = existing
    ? currentItems.map((item) =>
        item.skuId === product.skuId
          ? { ...item, quantity: Math.min((item.quantity || 1) + 1, 99) }
          : item,
      )
    : [
        {
          skuId: product.skuId,
          productId: product.id,
          productName: product.name,
          thumbnail: product.thumbnail ?? null,
          price: product.price,
          addedPrice: product.price,
          quantity: 1,
        },
        ...currentItems,
      ];

  localStorage.setItem(GUEST_CART_STORAGE_KEY, JSON.stringify(updated));
}

export function useHomeAddToCart() {
  const navigate = useNavigate();

  const addToCart = useCallback(
    async (product: HomeProduct) => {
      try {
        if (isSignedIn()) {
          // The cart of a signed-in customer is on the server: writing only to this browser would
          // leave the header (which reads the server's cart) showing nothing new
          await cartService.addItem(product.skuId, 1);
        } else {
          addToGuestCart(product);
        }
        window.dispatchEvent(new CustomEvent("cart:changed"));

        toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
          action: {
            label: "Xem giỏ hàng",
            onClick: () => navigate("/cart"),
          },
        });
      } catch (error) {
        // A refusal of the server was already shown, in its own words, by the API client
        if (error instanceof ApiError) return;
        toast.error("Không thể thêm vào giỏ hàng lúc này. Vui lòng thử lại!");
      }
    },
    [navigate],
  );

  return { addToCart };
}
