import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

// `base` matches the GitHub Pages path: https://<user>.github.io/Anatomy/
export default defineConfig({
  base: '/Anatomy/',
  plugins: [react()],
  // three.js alone is ~700 kB; one bundle is fine for this app.
  build: { chunkSizeWarningLimit: 1600 },
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
