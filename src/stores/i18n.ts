import { defineStore } from 'pinia'
import { useI18n } from 'vue-i18n'

export type Locale = 'zh_TW' | 'en_US'

export const useI18nStore = defineStore('i18n', () => {
  const { locale } = useI18n()

  // 從 localStorage 讀取語言設定
  const savedLocale = (localStorage.getItem('locale') as Locale) || 'zh_TW'

  // 初始化語言
  if (savedLocale) {
    locale.value = savedLocale
  }

  /**
   * 切換語言
   */
  function setLocale(newLocale: Locale) {
    locale.value = newLocale
    localStorage.setItem('locale', newLocale)
  }

  /**
   * 取得當前語言
   */
  function getLocale(): Locale {
    return locale.value as Locale
  }

  return {
    locale,
    setLocale,
    getLocale
  }
})
