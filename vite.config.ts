import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: parseInt(process.env.VITE_CLIENT_PORT || '3000'),
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
          'vendor-ai': ['@ai-sdk/react', 'ai'],
          'vendor-icons': ['react-icons'],
        },
      },
    },
  },
  esbuild: {
    target: 'esnext',
  },
});