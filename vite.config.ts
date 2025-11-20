import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { VitePluginRadar } from "vite-plugin-radar";
import path from "path";
import { execSync } from "child_process";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // 获取 Git commit hash
  let commitHash = env.VITE_GIT_COMMIT_HASH || "";
  if (!commitHash) {
    try {
      commitHash = execSync("git rev-parse --short HEAD").toString().trim();
    } catch (error) {
      console.warn("无法获取 Git commit hash:", error);
      commitHash = "unknown";
    }
  }

  return {
    plugins: [
      react(),
      VitePluginRadar({
        enableDev: true,
        analytics:
          env.VITE_GA_ENABLED === "true" && env.VITE_GA_TRACKING_ID
            ? {
                id: env.VITE_GA_TRACKING_ID,
              }
            : undefined,
        microsoftClarity:
          env.VITE_CLARITY_ENABLED === "true" && env.VITE_CLARITY_PROJECT_ID
            ? {
                id: env.VITE_CLARITY_PROJECT_ID,
              }
            : undefined,
      }),
    ],
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __GIT_COMMIT_HASH__: JSON.stringify(commitHash),
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ""),
        },
      },
    },
  };
});
