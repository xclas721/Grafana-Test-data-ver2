import { describe, expect, it, vi } from 'vitest'
import {
  validateDecimalMin,
  validateEmail,
  validateIpFormat,
  validateNumber,
  validatePattern,
  validateTel
} from '@/shared/utils/validation'

/**
 * validation：無狀態驗證工具（§4.0）。
 */
describe('validation', () => {
  describe('validatePattern', () => {
    it('符合正則應 result true', () => {
      expect(validatePattern('ab12', '[a-z0-9]+', 'bad')).toEqual({ result: true })
    })

    it('不符合應附訊息；有自訂 msg 時 messagePattern 為空字串', () => {
      expect(validatePattern('!!!', '[a-z]+', '自訂錯誤')).toEqual({
        result: false,
        message: '自訂錯誤',
        messagePattern: ''
      })
    })

    it('不符合且無自訊息時應用預設 message 與 regexp', () => {
      const v = validatePattern('x', '^z$', undefined as unknown as string)
      expect(v.result).toBe(false)
      expect(v.message).toBe('javax.validation.constraints.Pattern.message')
      expect(v.messagePattern).toEqual(['^z$'])
    })
  })

  describe('validateNumber', () => {
    it('僅數字應通過', () => {
      expect(validateNumber('0')).toEqual({ result: true })
      expect(validateNumber('123')).toEqual({ result: true })
    })

    it('非純數字應失敗', () => {
      expect(validateNumber('12a')).toEqual({ result: false, message: 'warn.num-only' })
      expect(validateNumber('')).toEqual({ result: false, message: 'warn.num-only' })
    })
  })

  describe('validateTel', () => {
    it('常見電話格式應通過', () => {
      expect(validateTel('0912345678').result).toBe(true)
      expect(validateTel('02-12345678').result).toBe(true)
    })

    it('明顯無效应失敗', () => {
      expect(validateTel('abc').result).toBe(false)
      expect(validateTel('abc').message).toBe('warn.user.tel.error')
    })
  })

  describe('validateEmail', () => {
    it('合法 Email 應通過', () => {
      expect(validateEmail('a@b.co').result).toBe(true)
    })

    it('不合法應回 warn.invalid-email', () => {
      const v = validateEmail('not-an-email')
      expect(v.result).toBe(false)
      expect(v.message).toBe('warn.invalid-email')
    })
  })

  describe('validateDecimalMin', () => {
    it('大於 min 應通過', () => {
      expect(validateDecimalMin('10', '5')).toEqual({ result: true })
    })

    it('等於或小於 min 應失敗並帶 messagePattern', () => {
      expect(validateDecimalMin('5', '5')).toEqual({
        result: false,
        message: 'javax.validation.constraints.DecimalMin.message',
        messagePattern: ['5']
      })
      expect(validateDecimalMin('3', '5').result).toBe(false)
    })
  })

  describe('validateIpFormat', () => {
    it('空字串應 false', () => {
      expect(validateIpFormat('')).toBe(false)
    })

    it('應接受 IPv4 與含 URL 的 IPv4', () => {
      expect(validateIpFormat('192.168.0.1')).toBe(true)
      expect(validateIpFormat('http://192.168.0.1:8080/api')).toBe(true)
    })

    it('應接受常見網域', () => {
      expect(validateIpFormat('example.com')).toBe(true)
      expect(validateIpFormat('sub.example.co.uk')).toBe(true)
    })

    it('無效字串應 false', () => {
      expect(validateIpFormat('###')).toBe(false)
      expect(validateIpFormat('not..valid')).toBe(false)
    })

    it('URL 解析失敗時應走 catch 並仍嘗試比對（不拋錯）', () => {
      const dbg = vi.spyOn(console, 'debug').mockImplementation(() => {})
      expect(() => validateIpFormat('http://[')).not.toThrow()
      dbg.mockRestore()
    })
  })
})
