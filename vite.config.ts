import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'path'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  const ctx = (env.VITE_FRONTEND_CONTEXT_PATH || '/').replace(/\/?$/, '/')
  const proxyApi = `${ctx}api`

  const isHttpsEnabled = env.VITE_HTTPS_ENABLED === 'true'
  const host = env.VITE_HOST || 'localhost'

  let httpsConfig: { key: string; cert: string } | undefined
  if (isHttpsEnabled) {
    const certsDir = path.resolve(__dirname, 'certs')
    const certPath = path.join(certsDir, 'cert.pem')
    const keyPath = path.join(certsDir, 'key.pem')

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
      httpsConfig = {
        key: fs.readFileSync(keyPath, 'utf8'),
        cert: fs.readFileSync(certPath, 'utf8')
      }
    } else {
      console.warn('HTTPS 憑證檔案不存在，回退到 HTTP')
    }
  }

  return {
    base: './',
    plugins: [
      vue(),
      tailwindcss(),
      mode === 'development' && vueDevTools(),
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia', 'vue-i18n'],
        dts: true,
        eslintrc: {
          enabled: true
        }
      }),
      Components({
        dirs: ['src/shared/components'],
        dts: true,
        extensions: ['vue']
      })
    ].filter(Boolean),
    server: {
      port: Number(env.VITE_FRONTEND_PORT) || 3000,
      host,
      https: httpsConfig,
      proxy: {
        [proxyApi]: {
          target: env.VITE_BACKEND_API_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (pathValue) => pathValue.replace(new RegExp(`^${proxyApi}`), '/api')
        }
      }
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) return

            // Vue 核心框架（router/pinia/i18n）
            if (
              id.includes('/node_modules/vue/') ||
              id.includes('/node_modules/vue-router/') ||
              id.includes('/node_modules/pinia/') ||
              id.includes('/node_modules/vue-i18n/')
            ) {
              return 'vendor-vue'
            }

            // 常用工具函式與日期處理
            if (id.includes('/node_modules/luxon/') || id.includes('/node_modules/@vueuse/')) {
              return 'vendor-utils'
            }

            // UI 互動元件
            if (id.includes('/node_modules/sweetalert2/')) {
              return 'vendor-ui'
            }

            return 'vendor-misc'
          }
        }
      }
    }
  }
})
