import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
// import tailwindcss fom "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  
});
