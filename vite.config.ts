import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          icons: ['@tabler/icons-react'],
          mantine: ['@mantine/core', '@mantine/hooks'],
        },
      },
    },
  },
  server: {
    port: 4310,
    strictPort: true,
  },
});
