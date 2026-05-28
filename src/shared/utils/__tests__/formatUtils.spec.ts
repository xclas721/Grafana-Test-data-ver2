import { describe, expect, it } from 'vitest'
import { conventTitle, isDifferent, valOrNA } from '@/shared/utils/format'

/**
 * format 工具：無 Pinia／i18n 依賴之純函式（§4.0）。
 */
describe('format 純函式', () => {
  describe('valOrNA', () => {
    it('null／undefined／空字串應回預設 N/A', () => {
      expect(valOrNA(null)).toBe('N/A')
      expect(valOrNA(undefined)).toBe('N/A')
      expect(valOrNA('')).toBe('N/A')
    })

    it('0 與 false 應保留為有效值', () => {
      expect(valOrNA(0)).toBe(0)
      expect(valOrNA(false)).toBe(false)
    })

    it('可自訂 defaultValue', () => {
      expect(valOrNA(null, '--')).toBe('--')
      expect(valOrNA('ok', 'x')).toBe('ok')
    })
  })

  describe('isDifferent', () => {
    it('空值族應視為相同', () => {
      expect(isDifferent(null, undefined)).toBe(false)
      expect(isDifferent('', null)).toBe(false)
    })

    it('一空一非空應為不同', () => {
      expect(isDifferent('a', '')).toBe(true)
      expect(isDifferent(null, 'a')).toBe(true)
    })

    it('字串應 trim 後比較', () => {
      expect(isDifferent('a', ' a ')).toBe(false)
      expect(isDifferent('a', 'b')).toBe(true)
    })

    it('型別不同應為不同', () => {
      expect(isDifferent('1', 1 as unknown as string)).toBe(true)
    })
  })

  describe('conventTitle', () => {
    it('應對應已知操作類型', () => {
      expect(conventTitle('ADD')).toBe('btn.new')
      expect(conventTitle('UPDATE')).toBe('btn.update')
      expect(conventTitle('UPLOAD')).toBe('btn.upload')
      expect(conventTitle('IMPORT')).toBe('btn.import')
      expect(conventTitle('LOAD')).toBe('btn.load')
    })

    it('未知類型應回 btn.detail', () => {
      expect(conventTitle('OTHER')).toBe('btn.detail')
    })
  })
})
