import { DateTime } from 'luxon'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import * as appProperties from '@/shared/utils/appProperties'

/**
 * appProperties：語系／時區工具（§4.0）。
 */
describe('appProperties', () => {
  describe('語系', () => {
    it('getSupportLocaleList 應含 zh-TW／zh-CN／en-US', () => {
      const list = appProperties.getSupportLocaleList()
      expect(list.map((x) => x.value)).toEqual(['zh-TW', 'zh-CN', 'en-US'])
    })

    it('getLocaleValue：en → en-US；未知 → en-US', () => {
      expect(appProperties.getLocaleValue('en')).toBe('en-US')
      expect(appProperties.getLocaleValue('unknown')).toBe('en-US')
    })

    it('getLocaleValue：支援值應原樣回傳', () => {
      expect(appProperties.getLocaleValue('zh-TW')).toBe('zh-TW')
    })

    it('getLocaleBackendValue 應對應 backendValue', () => {
      expect(appProperties.getLocaleBackendValue('zh-TW')).toBe('zh_TW')
      expect(appProperties.getLocaleBackendValue('xx')).toBe('en_US')
    })

    it('getLocaleLabel 應回標籤或 English', () => {
      expect(appProperties.getLocaleLabel('zh-TW')).toBe('繁體中文')
      expect(appProperties.getLocaleLabel('nope')).toBe('English')
    })
  })

  describe('getBrowserTimeZone', () => {
    it('應回非空字串且為 Luxon 合法時區（依執行環境 Intl）', () => {
      const z = appProperties.getBrowserTimeZone()
      expect(z.length).toBeGreaterThan(0)
      expect(DateTime.now().setZone(z).isValid).toBe(true)
    })

    it('無效時區應退回 Asia/Taipei', () => {
      const Real = Intl.DateTimeFormat
      ;(Intl as unknown as { DateTimeFormat: typeof Real }).DateTimeFormat = function () {
        return {
          resolvedOptions: () => ({ timeZone: 'Not/A_Real_Zone_XXX' })
        } as unknown as Intl.DateTimeFormat
      } as unknown as typeof Intl.DateTimeFormat
      try {
        expect(appProperties.getBrowserTimeZone()).toBe('Asia/Taipei')
      } finally {
        ;(Intl as unknown as { DateTimeFormat: typeof Real }).DateTimeFormat = Real
      }
    })

    it('Intl 拋錯應退回 Asia/Taipei', () => {
      const Real = Intl.DateTimeFormat
      ;(Intl as unknown as { DateTimeFormat: typeof Real }).DateTimeFormat = function () {
        throw new Error('x')
      } as unknown as typeof Intl.DateTimeFormat
      try {
        expect(appProperties.getBrowserTimeZone()).toBe('Asia/Taipei')
      } finally {
        ;(Intl as unknown as { DateTimeFormat: typeof Real }).DateTimeFormat = Real
      }
    })
  })

  describe('getTimezoneList', () => {
    beforeEach(() => {
      vi.spyOn(appProperties, 'getBrowserTimeZone').mockReturnValue('Asia/Taipei')
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('無 current 時應含瀏覽器選項並排除重複 Taipei', () => {
      const list = appProperties.getTimezoneList()
      const values = list.map((o) => o.value)
      expect(values[0]).toBe('Asia/Taipei')
      expect(values.filter((v) => v === 'Asia/Taipei').length).toBe(1)
      expect(list[0].label).toContain('Auto')
    })

    it('current 無效時應與無參數類似處理', () => {
      const list = appProperties.getTimezoneList('   ')
      expect(list[0].value).toBe('Asia/Taipei')
    })

    it('有效但不在預設清單的時區應插入 Custom TZ', () => {
      const list = appProperties.getTimezoneList('Europe/Paris')
      const custom = list.find((o) => o.label.startsWith('Custom TZ:'))
      expect(custom?.value).toBe('Europe/Paris')
    })
  })
})
