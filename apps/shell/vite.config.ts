import { fileURLToPath, URL } from "node:url";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { federation } from "@module-federation/vite";

// One copy of React for the whole page: the host and every remote use the same one, or hooks
// break ("invalid hook call") when two copies are loaded.
const REACT_RANGE = "^19.0.0";

export default defineConfig(({ mode }) => {
  // Where the remotes and the API are: from the environment (see .env.example), with the local
  // development addresses as the default
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const catalogUrl = env.VITE_CATALOG_URL ?? "http://localhost:3001";
  const checkoutUrl = env.VITE_CHECKOUT_URL ?? "http://localhost:3002";
  const apiUrl = env.VITE_API_URL ?? "http://localhost:4000";

  return {
    resolve: {
      alias: {
        "@": fileURLToPath(new URL("./src", import.meta.url)),
      },
    },
    plugins: [
      tsconfigPaths(),
      react(),
      tailwindcss(),
      federation({
        name: "shell",
        remotes: {
          catalog: {
            type: "module",
            name: "catalog",
            entry: `${catalogUrl}/remoteEntry.js`,
          },
          checkout: {
            type: "module",
            name: "checkout",
            entry: `${checkoutUrl}/remoteEntry.js`,
          },
        },
        shared: {
          react: { singleton: true, requiredVersion: REACT_RANGE },
          "react-dom": { singleton: true, requiredVersion: REACT_RANGE },
          // One login for every app: the same copy of the API client holds the token
          "@ecom/api": { singleton: true, requiredVersion: false },
        },
      }),
    ],
    server: {
      port: 3000,
      // The browser calls /api on this same origin and Vite forwards it to the backend, so there
      // is no cross-origin request (and no CORS) while developing
      proxy: {
        "/api": { target: apiUrl, changeOrigin: true },
      },
    },
  };
});
