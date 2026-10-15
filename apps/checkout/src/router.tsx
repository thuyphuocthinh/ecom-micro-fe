/* oxlint-disable react/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { CheckoutLayout } from "@/layouts/CheckoutLayout.tsx";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary.tsx";

const CartPage = lazy(() =>
  import("@/pages/CartPage.tsx").then((m) => ({ default: m.CartPage })),
);
const CheckoutPage = lazy(() =>
  import("@/pages/CheckoutPage.tsx").then((m) => ({ default: m.CheckoutPage })),
);
const PaymentPage = lazy(() =>
  import("@/pages/PaymentPage.tsx").then((m) => ({ default: m.PaymentPage })),
);
const OrderSuccessPage = lazy(() =>
  import("@/pages/OrderSuccessPage.tsx").then((m) => ({
    default: m.OrderSuccessPage,
  })),
);

export const router = createBrowserRouter([
  {
    element: <CheckoutLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: <CheckoutPage />,
      },
      {
        path: "/checkout/payment",
        element: <PaymentPage />,
      },
      {
        path: "/checkout/success",
        element: <OrderSuccessPage />,
      },
      {
        path: "*",
        element: <Navigate to="/cart" replace />,
      },
    ],
  },
]);
