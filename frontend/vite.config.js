import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '172.18.0.1',
    port: 3062,
    proxy: {
      '/api': 'http://172.18.0.1:3061',
      '/health': 'http://172.18.0.1:3061',
    },
  },
})
