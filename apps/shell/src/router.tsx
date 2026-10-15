/* oxlint-disable react/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";

import { StoreLayout } from "@/layouts/StoreLayout.tsx";
import { AuthLayout } from "@/layouts/AuthLayout.tsx";
import { AccountLayout } from "@/layouts/AccountLayout.tsx";
import { RequireAuth } from "@/components/RequireAuth.tsx";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary.tsx";

const HomePage = lazy(() =>
  import("@/pages/HomePage.tsx").then((m) => ({ default: m.HomePage })),
);
const LoginPage = lazy(() =>
  import("@/pages/LoginPage.tsx").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("@/pages/RegisterPage.tsx").then((m) => ({ default: m.RegisterPage })),
);
const ForgotPasswordPage = lazy(() =>
  import("@/pages/ForgotPasswordPage.tsx").then((m) => ({
    default: m.ForgotPasswordPage,
  })),
);
const ProfilePage = lazy(() =>
  import("@/pages/ProfilePage.tsx").then((m) => ({ default: m.ProfilePage })),
);
const AddressesPage = lazy(() =>
  import("@/pages/AddressesPage.tsx").then((m) => ({
    default: m.AddressesPage,
  })),
);
const OrdersPage = lazy(() =>
  import("@/pages/OrdersPage.tsx").then((m) => ({ default: m.OrdersPage })),
);
const OrderDetailPage = lazy(() =>
  import("@/pages/OrderDetailPage.tsx").then((m) => ({
    default: m.OrderDetailPage,
  })),
);
const NotFoundPage = lazy(() =>
  import("@/pages/NotFoundPage.tsx").then((m) => ({ default: m.NotFoundPage })),
);
const SearchPage = lazy(() =>
  import("catalog/SearchPage").then((m) => ({
    default: m.SearchPage || m.default,
  })),
);
const ProductDetailPage = lazy(() =>
  import("catalog/ProductDetailPage").then((m) => ({
    default: m.ProductDetailPage || m.default,
  })),
);
const CartPage = lazy(() =>
  import("checkout/CartPage").then((m) => ({
    default: m.CartPage || m.default,
  })),
);
const CheckoutPage = lazy(() =>
  import("checkout/CheckoutPage").then((m) => ({
    default: m.CheckoutPage || m.default,
  })),
);
const PaymentPage = lazy(() =>
  import("checkout/PaymentPage").then((m) => ({
    default: m.PaymentPage || m.default,
  })),
);
const OrderSuccessPage = lazy(() =>
  import("checkout/OrderSuccessPage").then((m) => ({
    default: m.OrderSuccessPage || m.default,
  })),
);

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/products/:id",
        element: <ProductDetailPage />,
      },
      {
        path: "/cart",
        element: <CartPage />,
      },
      {
        path: "/checkout",
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: "/checkout/payment",
        element: (
          <RequireAuth>
            <PaymentPage />
          </RequireAuth>
        ),
      },
      {
        path: "/checkout/success",
        element: (
          <RequireAuth>
            <OrderSuccessPage />
          </RequireAuth>
        ),
      },
      {
        path: "/products",
        element: <Navigate to="/search" replace />,
      },
      {
        path: "/account/orders/:id",
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          {
            index: true,
            element: <Navigate to="/account/profile" replace />,
          },
          {
            path: "profile",
            element: <ProfilePage />,
          },
          {
            path: "addresses",
            element: <AddressesPage />,
          },
          {
            path: "orders",
            element: <OrdersPage />,
          },
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
  {
    element: <AuthLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/login",
        element: <LoginPage />,
      },
      {
        path: "/register",
        element: <RegisterPage />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPasswordPage />,
      },
    ],
  },
]);
