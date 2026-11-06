import { fileURLToPath, URL } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// CYBER//BREACH build config. "@" points at src/ so imports read "@/game/store".
export default defineConfig({
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
