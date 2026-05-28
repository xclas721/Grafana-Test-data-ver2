import { beforeEach, describe, expect, it, vi } from 'vitest'

const { httpClientMock } = vi.hoisted(() => ({
  httpClientMock: {
    post: vi.fn()
  }
}))

vi.mock('@/shared/services/httpClient', () => ({
  httpClient: httpClientMock
}))

import { authService, getLoginErrorMessage } from '@/shared/services/authService'

/**
 * authService：登入 API 與 getLoginErrorMessage（§4.0）。
 */
describe('authService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('login', () => {
    it('應 POST /api/auth/login 並回傳 data，且 skipAppHeaders', async () => {
      const payload = { username: 'a', password: 'b' }
      const data = { token: 't', tokenType: 'Bearer' }
      httpClientMock.post.mockResolvedValue({ data })

      const result = await authService.login(payload)

      expect(result).toEqual(data)
      expect(httpClientMock.post).toHaveBeenCalledWith('/api/auth/login', payload, {
        skipAppHeaders: true
      })
    })
  })

  describe('frontLogin', () => {
    it('應 POST /api/front/auth/login 並回傳 data', async () => {
      const payload = { username: 'm', password: 'p' }
      const data = { token: 'ft' }
      httpClientMock.post.mockResolvedValue({ data })

      const result = await authService.frontLogin(payload)

      expect(result).toEqual(data)
      expect(httpClientMock.post).toHaveBeenCalledWith('/api/front/auth/login', payload, {
        skipAppHeaders: true
      })
    })
  })

  describe('getLoginErrorMessage', () => {
    it('status 401 → auth.error.401', () => {
      expect(getLoginErrorMessage({ status: 401 })).toEqual({ key: 'auth.error.401' })
    })

    it('TypeError → auth.error.network', () => {
      expect(getLoginErrorMessage(new TypeError('x'))).toEqual({ key: 'auth.error.network' })
    })

    it('message 含 Failed to fetch → network', () => {
      expect(getLoginErrorMessage({ message: 'Failed to fetch' })).toEqual({
        key: 'auth.error.network'
      })
    })

    it('message 含 timeout → timeout', () => {
      expect(getLoginErrorMessage({ message: 'request timeout' })).toEqual({
        key: 'auth.error.timeout'
      })
    })

    it('其他數字 status → auth.error.http 帶參數', () => {
      expect(getLoginErrorMessage({ status: 503 })).toEqual({
        key: 'auth.error.http',
        params: { status: 503 }
      })
    })

    it('僅有 message → withMessage', () => {
      expect(getLoginErrorMessage({ message: 'bad' })).toEqual({
        key: 'auth.error.withMessage',
        params: { msg: 'bad' }
      })
    })

    it('空物件 → unexpected', () => {
      expect(getLoginErrorMessage({})).toEqual({ key: 'auth.error.unexpected' })
    })
  })
})
