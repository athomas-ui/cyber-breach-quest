import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// CYBER//BREACH build config. "@" points at src/ so imports read "@/game/store".
// BASE_PATH is set by the GitHub Pages workflow, because the game is served from
// https://athomas-ui.github.io/cyber-breach-quest/ instead of the site root.
// Locally (npm run dev / build / preview) it stays "/".
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    chunkSizeWarningLimit: 1600,
    rollupOptions: {
      output: {
        // Keep the 3D engine in its own cached file so game code updates stay small.
        manualChunks(id) {
          if (id.includes('node_modules/three') || id.includes('@react-three')) return 'engine-3d';
          if (id.includes('node_modules')) return 'vendor';
          return undefined;
        }
      }
    }
  }
});
