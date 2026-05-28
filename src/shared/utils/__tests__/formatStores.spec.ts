import { describe, expect, it, vi, beforeEach } from 'vitest'

const { mockUseAppStore, mockUseI18n } = vi.hoisted(() => ({
  mockUseAppStore: vi.fn(),
  mockUseI18n: vi.fn()
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => mockUseAppStore()
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => mockUseI18n()
}))

import { dateFormat, getOptionsByValue, useTimeCalculations } from '@/shared/utils/format'

/**
 * format 依賴 Pinia／i18n 的函式（§4.0）。
 */
describe('format（store／i18n）', () => {
  beforeEach(() => {
    mockUseAppStore.mockReturnValue({
      timeZone: 'Asia/Taipei',
      getStartDate: '2020-06-01 00:00:00'
    })
    mockUseI18n.mockReturnValue({
      t: (key: string) => `tr:${key}`
    })
  })

  describe('dateFormat', () => {
    it('null／空字串應回 null', () => {
      expect(dateFormat(null)).toBeNull()
      expect(dateFormat('')).toBeNull()
    })

    it('應使用 App Store 時區（可覆寫 timeZone 參數）', () => {
      const iso = '2024-03-15T08:30:00.000Z'
      const withStoreTz = dateFormat(iso, 'yyyy-MM-dd HH:mm')
      expect(withStoreTz).toBeTruthy()
      const withUtc = dateFormat(iso, 'yyyy-MM-dd HH:mm', 'UTC')
      expect(withUtc).toBeTruthy()
      expect(mockUseAppStore).toHaveBeenCalled()
    })

    it('毫秒時間戳（> 1e10）與秒時間戳應走不同分支並皆可格式化', () => {
      expect(dateFormat(1_704_067_200_000, 'yyyy-MM-dd', 'UTC')).toBe('2024-01-01')
      expect(dateFormat(946_684_800, 'yyyy-MM-dd', 'UTC')).toBe('2000-01-01')
    })

    it('Date 實例應可格式化', () => {
      const d = new Date('2024-01-02T03:04:05.000Z')
      expect(dateFormat(d, 'yyyy-MM-dd', 'UTC')).toBe('2024-01-02')
    })

    it('無法解析應回 null', () => {
      expect(dateFormat('totally-not-a-date-zzz', 'yyyy-MM-dd', 'UTC')).toBeNull()
    })
  })

  describe('getOptionsByValue', () => {
    it('options 缺漏或空應回 defaultValue', () => {
      expect(getOptionsByValue('a', undefined)).toBe('N/A')
      expect(getOptionsByValue('a', null as unknown as undefined)).toBe('N/A')
      expect(getOptionsByValue('a', [])).toBe('N/A')
      expect(getOptionsByValue('a', [{ value: 'x', text: 'X' }], '--')).toBe('--')
    })

    it('val 為空應回 defaultValue', () => {
      expect(getOptionsByValue('', [{ value: '1', text: 'One' }])).toBe('N/A')
    })

    it('一般選項應回 text', () => {
      expect(getOptionsByValue(1, [{ value: 1, text: '一' }])).toBe('一')
    })

    it('i18n 選項應呼叫 t(i18nText)', () => {
      const v = getOptionsByValue('k', [{ value: 'k', i18nText: 'key.ok' } as any])
      expect(v).toBe('tr:key.ok')
    })

    it('i18n 拋錯時應回 defaultValue', () => {
      mockUseI18n.mockImplementationOnce(() => {
        throw new Error('no i18n')
      })
      expect(getOptionsByValue('k', [{ value: 'k', i18nText: 'key.x' } as any], 'FALL')).toBe(
        'FALL'
      )
    })

    it('找不到 value 應回 default', () => {
      expect(getOptionsByValue('nope', [{ value: 'a', text: 'A' }])).toBe('N/A')
    })
  })

  describe('useTimeCalculations', () => {
    it('getStartDate 應反映 store；getEndDate 應為現在時間字串', () => {
      const { getStartDate, getEndDate } = useTimeCalculations()
      expect(getStartDate.value).toBe('2020-06-01 00:00:00')
      expect(getEndDate.value).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)
    })
  })
})
