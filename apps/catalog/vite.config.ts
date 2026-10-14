import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

// The same one copy of React as the host (see apps/shell/vite.config.ts)
const REACT_RANGE = "^19.0.0";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiUrl = env.VITE_API_URL ?? "http://localhost:4000";

  return {
    resolve: {
      tsconfigPaths: true,
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: "catalog",
        filename: "remoteEntry.js",
        dts: false,
        exposes: {
          "./App": "./src/App.tsx",
          "./SearchPage": "./src/pages/SearchPage.tsx",
          "./ProductCard": "./src/features/products/components/ProductCard.tsx",
          "./ProductGrid": "./src/features/products/components/ProductGrid.tsx",
        },
        shared: {
          react: { singleton: true, requiredVersion: REACT_RANGE },
          "react-dom": { singleton: true, requiredVersion: REACT_RANGE },
          "react-router": { singleton: true },
          "@tanstack/react-query": { singleton: true },
          // One login for every app: the same copy of the API client holds the token
          "@ecom/api": { singleton: true, requiredVersion: false },
        },
      }),
    ],
    server: {
      port: 3001,
      // So the app also works on its own (pnpm --filter catalog dev): /api goes to the backend
      proxy: {
        "/api": { target: apiUrl, changeOrigin: true },
      },
    },
  };
});
