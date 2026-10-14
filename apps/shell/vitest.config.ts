import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  esbuild: { jsx: "automatic" },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
      "catalog/SearchPage": fileURLToPath(
        new URL("../catalog/src/pages/SearchPage.tsx", import.meta.url),
      ),
      "catalog/ProductDetailPage": fileURLToPath(
        new URL("../catalog/src/pages/ProductDetailPage.tsx", import.meta.url),
      ),
      "catalog/ProductCard": fileURLToPath(
        new URL(
          "../catalog/src/features/products/components/ProductCard.tsx",
          import.meta.url,
        ),
      ),
      "catalog/ProductGrid": fileURLToPath(
        new URL(
          "../catalog/src/features/products/components/ProductGrid.tsx",
          import.meta.url,
        ),
      ),
    },
  },
  test: {
    include: ["src/**/*.spec.{ts,tsx}"],
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    testTimeout: 15000,
  },
});
