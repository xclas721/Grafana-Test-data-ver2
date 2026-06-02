import { DateTime } from 'luxon'
import { describe, expect, it } from 'vitest'
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

  describe('IANA_TIMEZONE_VALUES', () => {
    it('應與 acs 相同為 38 個 IANA 時區', () => {
      expect(appProperties.IANA_TIMEZONE_VALUES).toHaveLength(38)
      expect(appProperties.IANA_TIMEZONE_VALUES[0]).toBe('Pacific/Pago_Pago')
      expect(appProperties.IANA_TIMEZONE_VALUES.at(-1)).toBe('Pacific/Kiritimati')
    })
  })

  describe('getTimezoneList', () => {
    it('應回傳完整 IANA 列表且標籤含 UTC 偏移', () => {
      const list = appProperties.getTimezoneList()
      expect(list).toHaveLength(38)
      expect(list.some((o) => o.value === 'Asia/Taipei')).toBe(true)
      expect(list.find((o) => o.value === 'Asia/Tokyo')?.label).toMatch(/^UTC\+9 \| Asia\/Tokyo$/)
    })

    it('有效但不在預設清單的時區應插入 Custom TZ', () => {
      const list = appProperties.getTimezoneList('Europe/Berlin')
      const custom = list.find((o) => o.label.startsWith('Custom TZ:'))
      expect(custom?.value).toBe('Europe/Berlin')
      expect(list).toHaveLength(39)
    })
  })

  describe('getTestDataTimezoneOptions', () => {
    it('應含 browser 與 38 個 IANA 時區', () => {
      const list = appProperties.getTestDataTimezoneOptions()
      expect(list[0]).toEqual({ value: 'browser', label: '瀏覽器時區 (自動檢測)' })
      expect(list).toHaveLength(39)
    })
  })

  describe('getTimezoneDisplayName', () => {
    it('browser 應回瀏覽器時區文案', () => {
      expect(appProperties.getTimezoneDisplayName('browser')).toBe('瀏覽器時區 (自動檢測)')
    })

    it('IANA 時區應回 formatTimezoneLabel 格式', () => {
      expect(appProperties.getTimezoneDisplayName('Asia/Taipei')).toMatch(
        /^UTC\+8 \| Asia\/Taipei$/
      )
    })
  })
})
