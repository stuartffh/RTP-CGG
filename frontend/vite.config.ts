import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  root: '.',
  base: '/app/',
  build: {
    outDir: path.resolve(__dirname, '../static/react'),
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    strictPort: true,
  },
});

