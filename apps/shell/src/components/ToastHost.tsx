import { useEffect } from "react";
import { Toaster, toast } from "sonner";
import { api } from "@ecom/api";

/**
 * The one place toasts are shown. Every failed API call of every app (shell, catalog, checkout) reaches
 * `api.onError`, because @ecom/api is a single shared copy, so the remotes need no toast of their own.
 * Customers read `userMessage`: friendly Vietnamese, never a code or a technical word.
 */
export function ToastHost() {
  useEffect(() => api.onError((error) => toast.error(error.userMessage)), []);

  return (
    <Toaster
      position="top-right"
      closeButton
      richColors
      visibleToasts={3}
      duration={8000}
    />
  );
}
