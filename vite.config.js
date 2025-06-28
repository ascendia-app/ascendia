// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // IMPORTANT: Set base path for GitHub Pages deployment.
  // Replace '/ascendia/' with '/YOUR_REPO_NAME/' if your repo name is different.
  base: '/ascendia/',
  server: {
    // Optional: If you want to force a specific port locally, e.g., 3000
    // port: 3000,
    // host: 'localhost', // or '0.0.0.0' to expose to network
  },
  build: {
    // Ensure all assets are relative paths for GitHub Pages
    assetsDir: 'assets', // default, but good to be explicit
    sourcemap: false, // Set to true for debugging production builds if needed
  }
});
