import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    react(),
    federation({
      name: "shell",
      remotes: {
        catalog: {
          type: "module",
          name: "catalog",
          entry: "http://localhost:3001/remoteEntry.js",
        },
        checkout: {
          type: "module",
          name: "checkout",
          entry: "http://localhost:3002/remoteEntry.js",
        },
      },
      shared: ["react", "react-dom"],
    }),
  ],
  server: {
    port: 3000,
  },
});
