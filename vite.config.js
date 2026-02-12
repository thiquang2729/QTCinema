import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Thêm dòng này vào:
    allowedHosts: true,
    // Bind IPv4 loopback để cloudflared không bị resolve sang ::1 (IPv6)
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
    proxy: {
      // Frontend gọi /api/... sẽ được proxy sang backend
      // Ví dụ: /api/movies -> http://localhost:5000/api/movies
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
