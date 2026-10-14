import { createBrowserRouter, Navigate } from "react-router";
import { CartPage } from "./pages/CartPage.tsx";

export const router = createBrowserRouter([
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/checkout",
    element: (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold font-head">Thanh toán</h1>
        <p className="text-muted mt-2">
          Trang thanh toán đang được hoàn thiện.
        </p>
      </div>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/cart" replace />,
  },
]);
