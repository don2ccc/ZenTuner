import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Expose process.env.API_KEY for the frontend usage as requested by the pattern
    // In production, it's better to use import.meta.env.VITE_API_KEY
    'process.env': process.env
  }
});