import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/cis': {
        target: 'http://54.198.209.187',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
