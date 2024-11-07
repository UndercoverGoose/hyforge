import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig(async () => ({
  build: {
    target: 'esnext',
  },
  server: {
    port: 5173,
    strictPort: true,
  },
  plugins: [tsconfigPaths()],
  base: './'
}));
