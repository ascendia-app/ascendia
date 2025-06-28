// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: This 'base' property is CRITICAL for GitHub Pages.
  // It must be '/YOUR_REPOSITORY_NAME/'.
  // For your repository 'ascendia', it should be '/ascendia/'.
  base: '/ascendia/', // <-- CONFIRM THIS IS EXACTLY LIKE THIS
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
