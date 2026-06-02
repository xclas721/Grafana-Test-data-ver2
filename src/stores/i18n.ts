import { defineStore } from 'pinia'
import { computed } from 'vue'
import i18n from '@/locales'

export type Locale = 'zh_TW' | 'en_US'

function isLocale(value: string): value is Locale {
  return value === 'zh_TW' || value === 'en_US'
}

export const useI18nStore = defineStore('i18n', () => {
  const savedLocale = localStorage.getItem('locale')
  if (savedLocale && isLocale(savedLocale)) {
    i18n.global.locale.value = savedLocale
  }

  const locale = computed({
    get: () => i18n.global.locale.value as Locale,
    set: (value: Locale) => {
      i18n.global.locale.value = value
      localStorage.setItem('locale', value)
    }
  })

  function setLocale(newLocale: Locale) {
    locale.value = newLocale
  }

  function getLocale(): Locale {
    return locale.value
  }

  return {
    locale,
    setLocale,
    getLocale
  }
})
