import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://ai-ecommerce-api-64m8.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'https://ai-ecommerce-api-64m8.onrender.com',
        changeOrigin: true,
        secure: false
      }
    }
  }
});
