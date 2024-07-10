import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import * as dotenv from 'dotenv';

dotenv.config();

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  root: 'view',
  server: {
    port: parseInt(process.env.CLIENT_PORT || '3000'),
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.SERVER_PORT}/api`,
        rewrite: (path: string) => path.replace(/^\/api/, ''),
        changeOrigin: true,
      },
      '/security.txt': {
        target: `http://localhost:${process.env.SERVER_PORT}/security.txt`,
        rewrite: (path: string) => path.replace(/^\/security\.txt/, ''),
        changeOrigin: true,
      },
    },
  },
  define: {
    'process.env': process.env,
  },
  build: {
    outDir: '../dist/view',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (
            id.includes('node_modules') &&
            !id.includes('node_modules/@apollo') &&
            !id.includes('node_modules/@mui')
          ) {
            return id
              .toString()
              .split('node_modules/')[1]
              .split('/')[0]
              .toString();
          }
        },
      },
    },
  },
});
