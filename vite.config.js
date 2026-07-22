import { defineConfig } from 'vite'
import { createVuePlugin } from 'vite-plugin-vue2'
import { resolve } from 'path'

export default defineConfig({
  plugins: [createVuePlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'packages'),
      '@components': resolve(__dirname, 'packages/components'),
      '@utils': resolve(__dirname, 'packages/utils'),
      '@constants': resolve(__dirname, 'packages/constants'),
      '@theme-chalk': resolve(__dirname, 'packages/theme-chalk'),
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
    port: 3000,
    // open: true,
  },
})
