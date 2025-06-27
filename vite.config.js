import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      // Only externalize prop-types if it's provided externally (e.g., library build)
      // external: ['prop-types'], // Uncomment only if building a library
    },
  },
});