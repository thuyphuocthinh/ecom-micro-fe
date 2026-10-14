/* oxlint-disable react/only-export-components */
import { lazy } from "react";
import { createBrowserRouter } from "react-router";
import { CatalogLayout } from "@/layouts/CatalogLayout.tsx";

const CatalogHomePage = lazy(() =>
  import("@/pages/CatalogHomePage.tsx").then((m) => ({
    default: m.CatalogHomePage,
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
    ],
  },
]);
