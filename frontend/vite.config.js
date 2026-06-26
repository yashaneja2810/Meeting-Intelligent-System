import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Polyfills for simple-peer
      'events': 'events',
      'util': 'util',
      'buffer': 'buffer',
      'stream': 'stream-browserify',
      'process': 'process/browser'
    }
  },
  define: {
    global: 'globalThis',
    'process.env': {}
  },
  optimizeDeps: {
    esbuildOptions: {
      define: {
        global: 'globalThis'
      }
    }
  },
  server: {
    port: 5173
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
