import { createBrowserRouter, Navigate } from "react-router";
import { StoreLayout } from "@/layouts/StoreLayout.tsx";
import { AuthLayout } from "@/layouts/AuthLayout.tsx";
import { AccountLayout } from "@/layouts/AccountLayout.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { LoginPage } from "@/pages/LoginPage.tsx";
import { RegisterPage } from "@/pages/RegisterPage.tsx";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage.tsx";
import { ProfilePage } from "@/pages/ProfilePage.tsx";
import { AddressesPage } from "@/pages/AddressesPage.tsx";
import { NotFoundPage } from "@/pages/NotFoundPage.tsx";

export const router = createBrowserRouter([
  {
    element: <StoreLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
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
