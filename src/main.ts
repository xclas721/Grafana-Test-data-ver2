import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { setupI18n } from './locales'
import { useThemeStore } from './stores/theme'

const app = createApp(App)

app.use(createPinia())
app.use(router)
setupI18n(app)

// 全域錯誤處理：避免未捕捉例外導致白屏
app.config.errorHandler = (error, _instance, info) => {
  console.error('[GlobalErrorHandler]', info, error)
  if (router.currentRoute.value.path !== '/500') {
    void router.replace('/500')
  }
}

window.addEventListener('unhandledrejection', (event) => {
  console.error('[UnhandledRejection]', event.reason)
  if (router.currentRoute.value.path !== '/500') {
    void router.replace('/500')
  }
})

// 初始化主題
const themeStore = useThemeStore()
themeStore.initTheme()

app.mount('#app')
