import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        // target: 'https://api.imjm-hair.com',
        target: 'http://localhost:8080',
        changeOrigin: true
      },
      '/ws': { // WebSocket에 대한 프록시 설정 추가
        // target: 'https://api.imjm-hair.com',
        target: 'ws://localhost:8080', // WebSocket 서버 포트
        changeOrigin: true,
        ws: true, // WebSocket 프록시 활성화
      }
    }
  },
  define: {
    global: 'window',
  }
})
