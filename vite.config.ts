import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  // Set your repo name here so assets resolve on GitHub Pages:
  base: '/Murray-Bridge-High-School-2025-SEPEP/',
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        student: resolve(__dirname, 'student/index.html'),
        teacher: resolve(__dirname, 'teacher/index.html'),
      },
    },
  },
});
