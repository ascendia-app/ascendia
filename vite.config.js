// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This 'base' property is CRITICAL for GitHub Pages.
  // It should be '/YOUR_REPOSITORY_NAME/'.
  // Since your repository is 'ascendia', it must be '/ascendia/'.
  base: '/ascendia/', // <-- ENSURE THIS LINE IS CORRECT!
  server: {
    // Optional: If you want to force a specific port locally, e.g., 3000
    // port: 3000,
    // host: '0.0.0.0', // or 'localhost' to expose to network
  },
  build: {
    // Ensure all assets are relative paths for GitHub Pages
    assetsDir: 'assets', // default, but good to be explicit
    sourcemap: false, // Set to true for debugging production builds if needed
  }
});
