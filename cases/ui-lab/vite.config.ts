import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
export default defineConfig({ cacheDir: 'node_modules/.vite-lab', resolve: { dedupe: ['react', 'react-dom'] }, plugins: [react()], build: { rollupOptions: { output: {
  entryFileNames: 'assets/[name].js', chunkFileNames: 'assets/[name].js', assetFileNames: 'assets/[name][extname]',
} } } });
