/* oxlint-disable react/only-export-components */
import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import { CatalogLayout } from "@/layouts/CatalogLayout.tsx";

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

export const router = createBrowserRouter([
  {
    element: <CatalogLayout />,
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
        path: "/products",
        element: <Navigate to="/search" replace />,
      },
    ],
  },
]);
