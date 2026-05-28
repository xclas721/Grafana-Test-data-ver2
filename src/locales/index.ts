import { createI18n } from 'vue-i18n'
import type { App } from 'vue'
import zh_TW from './lang/zh_TW'
import en_US from './lang/en_US'

// 從 localStorage 讀取語言設定，預設為繁體中文
const savedLocale = localStorage.getItem('locale') || 'zh_TW'

// 註冊 i18n 實例並引入語言檔案
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: savedLocale,
  fallbackLocale: 'zh_TW', // 回退語言
  messages: {
    zh_TW,
    en_US
  }
})

// 全域註冊 i18n
export function setupI18n(app: App<Element>) {
  app.use(i18n)
}

export default i18n
