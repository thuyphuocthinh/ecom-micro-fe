import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthContext } from "@/features/auth/auth-context.ts";
import { catalogService } from "@/services/catalog.service.ts";
import { StoreLayout } from "./StoreLayout.tsx";
import { HomePage } from "@/pages/HomePage.tsx";

// The tests run from the folder of the app (apps/shell), so the other apps are one level up
const appsFolder = resolve(process.cwd(), "..");
const read = (path: string) => readFileSync(path, "utf8");

/** The page components of an app: its pages folder, tests left out. */
function pagesOf(app: string) {
  const folder = resolve(appsFolder, app, "src", "pages");
  return readdirSync(folder)
    .filter((name) => name.endsWith(".tsx") && !name.includes(".spec."))
    .map((name) => ({
      name: `${app}/${name}`,
      source: read(resolve(folder, name)),
    }));
}

describe("one <main> per page (AC-18)", () => {
  const pages = ["shell", "catalog", "checkout"].flatMap(pagesOf);

  it("finds the pages (so the checks below are not empty)", () => {
    expect(pages.length).toBeGreaterThanOrEqual(15);
  });

  it.each(pages.map((page) => [page.name, page.source] as const))(
    "%s does not render its own <main> (the layout has it)",
    (_name, source) => {
      expect(source).not.toMatch(/<main\b/);
      expect(source).not.toMatch(/id="main"/);
    },
  );

  it.each([
    ["shell", "layouts/StoreLayout.tsx"],
    ["shell", "layouts/AuthLayout.tsx"],
    ["catalog", "layouts/CatalogLayout.tsx"],
    ["checkout", "layouts/CheckoutLayout.tsx"],
  ])("the %s layout %s has exactly one <main>, with id=main", (app, file) => {
    const source = read(resolve(appsFolder, app, "src", file));

    expect(source.match(/<main\b/g)).toHaveLength(1);
    expect(source).toMatch(/id="main"/);
  });
});

describe("the page inside its layout (AC-18)", () => {
  it("the home page in the store layout has exactly one main landmark, and the skip link points to it", async () => {
    vi.spyOn(catalogService, "getCategories").mockResolvedValue([]);
    vi.spyOn(catalogService, "getBestsellers").mockResolvedValue([]);
    const router = createMemoryRouter(
      [
        {
          element: <StoreLayout />,
          children: [{ path: "/", element: <HomePage /> }],
        },
      ],
      { initialEntries: ["/"] },
    );

    const { container } = render(
      <QueryClientProvider
        client={
          new QueryClient({ defaultOptions: { queries: { retry: false } } })
        }
      >
        <AuthContext.Provider
          value={{
            status: "guest",
            user: null,
            cartCount: 0,
            login: vi.fn(),
            logout: vi.fn(),
          }}
        >
          <RouterProvider router={router} />
        </AuthContext.Provider>
      </QueryClientProvider>,
    );
    await screen.findByRole("heading", { name: "Mua theo nhóm" });

    expect(screen.getAllByRole("main")).toHaveLength(1);
    expect(container.querySelectorAll("#main")).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: "Bỏ qua, tới nội dung chính" }),
    ).toHaveAttribute("href", "#main");
  });
});
