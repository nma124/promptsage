import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { copyFileSync, mkdirSync } from 'fs'

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      closeBundle() {
        const dist = resolve(__dirname, 'dist-extension')
        copyFileSync(resolve(__dirname, 'manifest.json'), resolve(dist, 'manifest.json'))
        copyFileSync(resolve(__dirname, 'public/favicon.svg'), resolve(dist, 'favicon.svg'))
      },
    },
  ],
  define: {
    'import.meta.env.VITE_EXT': JSON.stringify('1'),
  },
  base: './',
  build: {
    outDir: 'dist-extension',
    emptyOutDir: true,
  },
})
