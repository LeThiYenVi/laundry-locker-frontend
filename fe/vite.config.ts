import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true,
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "./src"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - split large dependencies
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-redux': ['@reduxjs/toolkit', 'react-redux'],
          'vendor-ui': ['lucide-react', 'class-variance-authority', 'clsx', 'tailwind-merge'],
          'vendor-chart': ['recharts'],
          'vendor-table': ['@tanstack/react-table'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Increase warning limit to 1000KB
  },
})
