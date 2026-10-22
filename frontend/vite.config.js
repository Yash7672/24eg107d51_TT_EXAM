import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 'true' allows access from other devices in the same network, which is
    // handy when you want to test the mobile layout during the lab.
    host: true,
  },
});
