import react from '@vitejs/plugin-react-swc';
import path from 'path';
import type {UserConfig} from 'vite';
import {defineConfig, loadEnv} from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({mode}): UserConfig => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    worker: {
      format: 'es',
    },
    build: {
      outDir: 'dist',
      rollupOptions: {
        external: [''],
        output: {
          manualChunks: {
            react: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: [
              '@radix-ui/react-accordion',
              '@radix-ui/react-avatar',
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-icons',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip',
            ],
            table: ['@tanstack/react-table', '@xyflow/react'],
            style: ['framer-motion', 'tailwindcss-animate', 'react-day-picker'],
            misc: [
              'jwt-decode',
              '@radix-ui/react-context-menu',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-tabs',
              '@hookform/resolvers',
              'cmdk',
              'zod',
              '@radix-ui/react-alert-dialog',
              '@radix-ui/react-switch',
            ],
            form: [
              'react-hook-form',
              'swr',
              'axios',
              'globals',
              'class-variance-authority',
              'clsx',
              'date-fns',
              'tailwind-merge',
              'lucide-react',
            ],
            others: ['exceljs', 'elkjs', '@radix-ui/react-scroll-area'],
          },
        },
      },
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 2000,
      sourcemap: mode === 'development',
    },
    define: {
      'import.meta.env.VITE_API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL),
      'import.meta.env.VITE_FAST_API_BACKEND': JSON.stringify(env.VITE_FAST_API_BACKEND),
    },
    optimizeDeps: {
      exclude: ['web-worker'],
    },
  };
});
