/* oxlint-disable react/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { CatalogLayout } from "@/layouts/CatalogLayout.tsx";
import { RouteErrorBoundary } from "@/components/RouteErrorBoundary.tsx";

const CatalogHomePage = lazy(() =>
  import("@/pages/CatalogHomePage.tsx").then((m) => ({
    default: m.CatalogHomePage,
  })),
);

const SearchPage = lazy(() =>
  import("@/pages/SearchPage.tsx").then((m) => ({
    default: m.SearchPage,
  })),
);

const ProductDetailPage = lazy(() =>
  import("@/pages/ProductDetailPage.tsx").then((m) => ({
    default: m.ProductDetailPage,
  })),
);

export const router = createBrowserRouter([
  {
    element: <CatalogLayout />,
    errorElement: <RouteErrorBoundary />,
    children: [
      {
        path: "/",
        element: <CatalogHomePage />,
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
        path: "/products",
        element: <Navigate to="/search" replace />,
      },
    ],
  },
]);
