import { fileURLToPath } from "node:url";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    target: "esnext",
    rollupOptions: {
      output: {
        manualChunks: {
          "api-client": ["./src/lib/client.ts"],
          "react-vendor": ["react", "react-dom", "react-router"],
          "ui-vendor": ["@headlessui/react", "@heroicons/react"],
          "data-vendor": ["@tanstack/react-query", "zustand"],
        },
      },
    },
  },
});
