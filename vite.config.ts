import path from "path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "");
  const clientPort = Number.parseInt(env.CLIENT_PORT || "3000", 10);
  const serverPort = Number.parseInt(env.SERVER_PORT || "3100", 10);
  const host = env.HOST || "localhost";

  return {
    envDir: __dirname,
    root: path.resolve(__dirname, "view"),
    server: {
      port: clientPort,
      proxy: {
        "/api": {
          target: `http://${host}:${serverPort}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "view/src"),
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: [path.resolve(__dirname, "view/src/test/test-setup.ts")],
    },
  };
});
