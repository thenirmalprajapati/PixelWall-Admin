import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://loopbit-pixelwall.azurewebsites.net', // Live Azure API URL
        changeOrigin: true,
        secure: false
      },
      '/wallpapers': {
        target: 'https://loopbit-pixelwall.azurewebsites.net',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
