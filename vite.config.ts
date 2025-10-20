import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: parseInt(process.env.VITE_CLIENT_PORT || '3000'),
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      external: [],
    },
  },
  esbuild: {
    target: 'esnext',
  },
})