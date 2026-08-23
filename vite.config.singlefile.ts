import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { viteSingleFile } from 'vite-plugin-singlefile'
import path from 'node:path'

/**
 * Single-file build, used only to produce a shareable preview.
 *
 * Inlines all JS and CSS into one self-contained index.html so the app can be
 * served from any raw file host without needing asset path resolution. Fonts
 * still come from the Google Fonts CDN.
 *
 *   npx vite build --config vite.config.singlefile.ts
 */
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist-single',
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    reportCompressedSize: false,
  },
})
