import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/@tabler/icons-react')) {
            return 'icons';
          }

          if (id.includes('node_modules/@mantine/core') || id.includes('node_modules/@mantine/hooks')) {
            return 'mantine';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    port: 4310,
    strictPort: true,
  },
});
