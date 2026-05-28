import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (_key: string, fallback?: string) => fallback ?? 'FB'
  })
}))

import { useLoadingStore } from '@/stores/loading'

/**
 * loading store（§4.0）
 */
describe('loading store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  describe('startLoading', () => {
    it('應設為載入中並使用預設訊息', () => {
      const s = useLoadingStore()
      s.startLoading()
      expect(s.loading).toBe(true)
      expect(s.message).toBe('載入中...')
    })

    it('應可自訂訊息', () => {
      const s = useLoadingStore()
      s.startLoading('請稍候')
      expect(s.loading).toBe(true)
      expect(s.message).toBe('請稍候')
    })
  })

  describe('finishLoading', () => {
    it('應關閉載入狀態', () => {
      const s = useLoadingStore()
      s.startLoading()
      s.finishLoading()
      expect(s.loading).toBe(false)
    })
  })

  describe('resetLoading', () => {
    it('應關閉載入並還原預設訊息', () => {
      const s = useLoadingStore()
      s.startLoading('自訂')
      s.resetLoading()
      expect(s.loading).toBe(false)
      expect(s.message).toBe('載入中...')
    })
  })
})
