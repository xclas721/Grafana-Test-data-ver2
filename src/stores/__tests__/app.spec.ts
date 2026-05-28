import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Ref } from 'vue'
import { nextTick, unref } from 'vue'

const getBrowserTimeZoneMock = vi.hoisted(() => vi.fn(() => 'Asia/Taipei'))

vi.mock('@/shared/utils/appProperties', () => ({
  getBrowserTimeZone: () => getBrowserTimeZoneMock()
}))

import { useAppStore } from '@/stores/app'

/**
 * app store：時區、側邊欄、動態日期（§4.0）
 */
describe('app store', () => {
  beforeEach(() => {
    localStorage.removeItem('timeZone')
    getBrowserTimeZoneMock.mockReturnValue('Asia/Taipei')
    setActivePinia(createPinia())
  })

  describe('timeZone', () => {
    it('changeTimeZone 應更新時區', async () => {
      const s = useAppStore()
      s.changeTimeZone('UTC')
      await nextTick()
      expect(unref(s.timeZone as unknown as Ref<string>)).toBe('UTC')
    })

    it('localStorage 為無效 IANA 時應回退 getBrowserTimeZone', async () => {
      localStorage.setItem('timeZone', JSON.stringify('Not/A_Real_Zone_XXX'))
      setActivePinia(createPinia())
      const s = useAppStore()
      await nextTick()
      expect(unref(s.timeZone as unknown as Ref<string>)).toBe('Asia/Taipei')
      expect(getBrowserTimeZoneMock).toHaveBeenCalled()
    })
  })

  describe('toggleSidebar', () => {
    it('應切換 isCollapsed', () => {
      const s = useAppStore()
      expect(s.isCollapsed).toBe(false)
      s.toggleSidebar()
      expect(s.isCollapsed).toBe(true)
      s.toggleSidebar()
      expect(s.isCollapsed).toBe(false)
    })
  })

  describe('getStartDate / getEndDate', () => {
    it('應為 yyyy-MM-dd HH:mm:ss 格式', () => {
      const s = useAppStore()
      const re = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/
      expect(s.getStartDate).toMatch(re)
      expect(s.getEndDate).toMatch(re)
    })

    it('調整 startDate／dateUnit 應改變 getStartDate', () => {
      const s = useAppStore()
      const before = s.getStartDate
      s.startDate = 0
      s.dateUnit = 'day'
      expect(s.getStartDate).not.toBe(before)
    })
  })
})
