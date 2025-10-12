import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: parseInt(process.env.VITE_CLIENT_PORT || '3000'),
  },
  build: {
    // Use esbuild for better Vercel compatibility
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    // Use esbuild for faster builds
    target: 'esnext',
  },
})
