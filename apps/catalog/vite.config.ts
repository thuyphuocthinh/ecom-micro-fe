import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import { federation } from "@module-federation/vite";

// The same one copy of React as the host (see apps/shell/vite.config.ts)
const REACT_RANGE = "^19.0.0";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiUrl = env.VITE_API_URL ?? "http://localhost:4000";

  return {
    plugins: [
      tsconfigPaths(),
      react(),
      tailwindcss(),
      federation({
        name: "catalog",
        filename: "remoteEntry.js",
        exposes: {
          "./App": "./src/App.tsx",
        },
        shared: {
          react: { singleton: true, requiredVersion: REACT_RANGE },
          "react-dom": { singleton: true, requiredVersion: REACT_RANGE },
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
