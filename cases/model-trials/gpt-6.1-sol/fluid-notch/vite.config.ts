import { defineConfig } from 'vite';
export default defineConfig({
  cacheDir: '.vite-fluid-notch-sol',
  resolve: { dedupe: ['react', 'react-dom'] },
  server: { host: '127.0.0.1', port: 4231, strictPort: true, hmr: false, watch: null },
  preview: { host: '127.0.0.1', port: 4231, strictPort: true },
});
