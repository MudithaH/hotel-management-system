import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    // Proxy disabled - using direct API URL from VITE_API_URL env variable
    // This allows connecting to Railway backend or local backend via env var
    // proxy: {
    //   '/api': {
    //     target: 'http://localhost:5000',
    //     changeOrigin: true
    //   }
    // }
  }
})