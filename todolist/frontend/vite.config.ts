import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    // Remove 'lucide-react' from the exclude list
  },
  resolve: {
    alias: {
      // Ensure proper resolution of node modules
      '@': '/src',
    },
  },
});
