import { createBrowserRouter } from "react-router";
import { StoreLayout } from "@/layouts/StoreLayout.tsx";
import { AuthLayout } from "@/layouts/AuthLayout.tsx";
import { HomePage } from "@/pages/HomePage.tsx";
import { LoginPage } from "@/pages/LoginPage.tsx";
import { RegisterPage } from "@/pages/RegisterPage.tsx";
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage.tsx";
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
