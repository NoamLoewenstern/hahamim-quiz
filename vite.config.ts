import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "~": "/src",
    },
  },
  server: {
    // This is the default value, and will add all files with node_modules
    // in their paths to the ignore list.
    sourcemapIgnoreList(sourcePath: string, sourcemapPath) {
      return sourcePath.includes("node_modules") || sourcePath.includes("original-website");
    },
  },
});
