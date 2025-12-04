import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isTauri = process.env.TAURI_PLATFORM !== undefined;
  
  return {
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
      watch: {
        // Tell vite to ignore watching `src-tauri`
        ignored: ["**/src-tauri/**"],
      },
    },
    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Tauri expects a fixed port, fail if that port is not available
    clearScreen: false,
    // Tauri uses a fixed port, so we need to set it
    envPrefix: ["VITE_", "TAURI_"],
    build: {
      // Tauri supports es2021
      target: isTauri ? ["es2021", "chrome100", "safari13"] : undefined,
      // don't minify for debug builds
      minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
      // produce sourcemaps for debug builds
      sourcemap: !!process.env.TAURI_DEBUG,
    },
  };
});
