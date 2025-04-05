import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // eslint-disable-next-line no-undef
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'public/background.js'),
        options: resolve(__dirname, 'public/options.html')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  base: './', // This is crucial for Chrome extensions
  server: {
    port: 3000
  },
  publicDir: 'public',
  define: {
    // Make env variables available to the client
    // eslint-disable-next-line no-undef
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL)
  }
})
