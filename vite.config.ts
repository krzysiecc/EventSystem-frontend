/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { fileURLToPath } from "node:url";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "EventHub",
        short_name: "EventHub",
        description: "System zarządzania wydarzeniami i biletami studenckimi",
        theme_color: "#f1dac4", // --bg-primary light mode
        background_color: "#0d0c1d", // --bg-primary dark mode
        display: "standalone",
        orientation: "portrait",
        // NOTE: to make the app installable with proper icons, add
        // icon-192x192.png and icon-512x512.png to public/ and list them here.
        icons: [],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },

  server: { port: 3000 },
});
