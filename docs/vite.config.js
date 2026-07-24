import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  root: __dirname,
  base: process.env.VITE_BASE || '/',
  plugins: [createVuePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, '../packages'),
      '@v2plus': resolve(__dirname, '../packages/v2plus'),
      '@components': resolve(__dirname, '../packages/components'),
      '@theme-chalk': resolve(__dirname, '../packages/theme-chalk'),
      '@utils': resolve(__dirname, '../packages/utils'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        // Vite 4 仍使用 Sass legacy JS API，且项目 scss 暂用 @import；
        // 升级到 Vite 5.4+ 后可改用 api: 'modern-compiler' 并迁移 @import → @use
        silenceDeprecations: ['legacy-js-api', 'import'],
      },
    },
  },
  server: {
    port: 3001,
    // open: true,
  },
})
