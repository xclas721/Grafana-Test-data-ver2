import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const mockLocale = vi.hoisted(() => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { ref } = require('vue') as typeof import('vue')
  return ref<'zh_TW' | 'en_US'>('zh_TW')
})

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale: mockLocale,
    t: (k: string) => k
  })
}))

import { useI18nStore } from '@/stores/i18n'

/**
 * i18n store（§4.0）
 */
describe('i18n store', () => {
  beforeEach(() => {
    localStorage.removeItem('locale')
    mockLocale.value = 'zh_TW'
    setActivePinia(createPinia())
  })

  describe('初始化', () => {
    it('無 localStorage 時應預設 zh_TW', () => {
      useI18nStore()
      expect(mockLocale.value).toBe('zh_TW')
    })

    it('應讀取 localStorage 的 locale', () => {
      localStorage.setItem('locale', 'en_US')
      mockLocale.value = 'zh_TW'
      setActivePinia(createPinia())
      useI18nStore()
      expect(mockLocale.value).toBe('en_US')
    })
  })

  describe('setLocale', () => {
    it('應同步 vue-i18n 與 localStorage', () => {
      const s = useI18nStore()
      s.setLocale('en_US')
      expect(mockLocale.value).toBe('en_US')
      expect(localStorage.getItem('locale')).toBe('en_US')
    })
  })

  describe('getLocale', () => {
    it('應回傳目前 locale', () => {
      const s = useI18nStore()
      s.setLocale('en_US')
      expect(s.getLocale()).toBe('en_US')
    })
  })
})
