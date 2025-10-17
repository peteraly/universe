import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',  // Root path for production (hyyper.co)
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true
  },
  server: {
    port: 3000,
    host: '0.0.0.0',  // Listen on all network interfaces
    strictPort: false,
    cors: true,
    proxy: {
      '/wp-json': {
        target: 'https://hyyper.co',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path
      }
    }
  }
})
