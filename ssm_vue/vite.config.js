import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    port: 5173, // 固定端口号为 5173
    open: true, // 自动打开浏览器
  },
  proxy: {
    '/user': {
      target: 'http://localhost:8080', // 后端服务地址
      changeOrigin: true,
    },
  },

})
