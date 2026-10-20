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
    //VITE_IS_LOCAL: z.enum(["true", "false"]).transform((val) => val === "true"),
    VITE_BACKEND_BASE_URL: z.string().url(), // Strictly enforces a valid HTTP URL format
  });

  const parsed = viteConfigSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error("Vite Build Configuration Failed:", parsed.error.format());
    throw new Error("Unable to start app due to invalid VITE environment variables");
  }

  //const isLocal = parsed.data.VITE_IS_LOCAL;
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