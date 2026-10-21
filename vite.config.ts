/**
 * ============================================================================
 * VITE BUILD & DEVELOPMENT CONFIGURATION
 * ============================================================================
 *
 * WHEN THIS RUNS:
 * This configuration file runs in a Node.js environment every time a Vite
 * command is executed. This includes local development (`npm run dev`) AND
 * production compiling (`npm run build`). It does NOT run in the browser.
 *
 * WHAT THIS FILE DOES:
 *  - Plugin Setup: Integrates React (@vitejs/plugin-react) and Tailwind CSS
 *    v4 (@tailwindcss/vite) compilation tools into the build pipeline.
 *  - Path Aliasing: Configures the '@/' prefix shortcut to point directly to
 *    the './src' directory for cleaner import paths.
 *  - Dev Server Proxying: Intercepts local client requests starting with '/api'
 *    and proxies them to the backend server (replicating what the frontend proxy
 *    does in hosted cloud environments via Vercel's middleware.ts file).
 */

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig,loadEnv } from "vite";
import { z } from "zod";

export default defineConfig(({ mode }) => {
  // Load raw strings from your active environment files
  // Required in addition to the constants/index.ts profile as Vite runs earlier, during build
  const rawEnv = loadEnv(mode, process.cwd(), "");

  const viteConfigSchema = z.object({
    VITE_BACKEND_BASE_URL: z.string().url(), // Strictly enforces a valid HTTP URL format
  });

  const parsed = viteConfigSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error("Vite Build Configuration Failed:", parsed.error.format());
    throw new Error("Unable to start app due to invalid VITE environment variables");
  }

  const backendBaseUrl = parsed.data.VITE_BACKEND_BASE_URL;

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: backendBaseUrl,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ""), //required to avoid '/api' duplicating in the URL
        },
      },
    },
  }
});