import { defineConfig } from 'vite';
import path from 'path';
export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // 将 @ 映射到 src 目录
    },
  },
});
