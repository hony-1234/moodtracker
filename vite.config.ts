import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [
      {
        name: 'clear-site-data-middleware',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            // If requested with ?clean or ?clear_sw or /clean-sw, tell browser to purge all service workers and caches
            if (req.url && (req.url.includes('clean') || req.url.includes('clear_sw') || req.url.includes('reset'))) {
              res.setHeader('Clear-Site-Data', '"cache", "storage"');
            }
            next();
          });
        },
      },
      react(),
      tailwindcss()
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('recharts') || id.includes('d3-') || id.includes('react-is')) {
                return 'vendor-charts';
              }
              if (id.includes('motion') || id.includes('framer-motion')) {
                return 'vendor-motion';
              }
              if (id.includes('lucide-react')) {
                return 'vendor-icons';
              }
            }
          },
        },
      },
    },
    server: {
      port: 5173,
      host: '0.0.0.0',
      cors: true,
      proxy: {
        '/api': {
          target: 'https://moodtracker-app-d6b42.web.app',
          changeOrigin: true,
        },
      },
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
