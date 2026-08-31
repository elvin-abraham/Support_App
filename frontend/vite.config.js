import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Lets the frontend call "/api/..." and load "/uploads/..." images
      // during dev without CORS pain.
      "/api": "http://localhost:4000",
      "/uploads": "http://localhost:4000",
    },
  },
});
