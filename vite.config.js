import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  server: {
    host: true
  },
  build: {
    rollupOptions: {
      input: {
        meniu: resolve(__dirname, 'meniu.html'),
        receptie: resolve(__dirname, 'receptie.html'),
        ospatar: resolve(__dirname, 'ospatar.html'),
        admin: resolve(__dirname, 'admin.html'),
        index: resolve(__dirname, 'index.html')
      }
    }
  }
});
