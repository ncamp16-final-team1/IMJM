import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://www.api.imjm-hair.com/',
        changeOrigin: true
      },
      '/ws': { // WebSocket에 대한 프록시 설정 추가
        target: 'http://www.api.imjm-hair.com/',
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
      }
    }
  },
  define: {
    global: 'window',
  }
})
