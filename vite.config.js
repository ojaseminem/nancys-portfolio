import { defineConfig } from 'vite';

// Relative base so the build works on GitHub Pages (project sub-path) or any static host.
export default defineConfig({
  base: './',
  build: { target: 'es2020', assetsInlineLimit: 2048 },
});
