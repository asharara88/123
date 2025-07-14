import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ['lucide-react']
  },
  server: {
    port: 5173, // Run on port 5173 instead of 3000
  },
  build: {
    outDir: 'dist', 
    sourcemap: true,
    assetsInlineLimit: 0,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['framer-motion', 'lucide-react', 'chart.js', 'react-chartjs-2'],
        }
      }
    }
  },
  optimizeDeps: {
    include: ['react-router-dom', 'framer-motion', 'lucide-react']
  },
});