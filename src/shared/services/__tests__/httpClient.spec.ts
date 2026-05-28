import { beforeEach, describe, expect, it, vi } from 'vitest'

const { mockAuthStrategy, mockFrontStrategy, mockLoadingStore, mockRouter } = vi.hoisted(() => ({
  mockAuthStrategy: {
    get: vi.fn(() => 'admin-token'),
    set: vi.fn(),
    remove: vi.fn()
  },
  mockFrontStrategy: {
    get: vi.fn(() => 'front-token'),
    set: vi.fn(),
    remove: vi.fn()
  },
  mockLoadingStore: {
    startLoading: vi.fn(),
    finishLoading: vi.fn()
  },
  mockRouter: {
    currentRoute: { value: { path: '/dashboard', fullPath: '/dashboard?tab=main' } },
    replace: vi.fn()
  }
}))

vi.mock('@/shared/config/appConfig', () => ({
  appConfig: {
    API_BASE_URL: 'http://localhost:8080',
    BACKEND_API_TIMEOUT: 3000
  }
}))

vi.mock('@/shared/tokenStorage', () => ({
  getAuthTokenStrategy: () => mockAuthStrategy,
  getFrontTokenStrategy: () => mockFrontStrategy
}))

vi.mock('@/stores/loading', () => ({
  useLoadingStore: () => mockLoadingStore
}))

vi.mock('@/stores/app', () => ({
  useAppStore: () => ({ timeZone: 'Asia/Taipei' })
}))

vi.mock('@/stores/i18n', () => ({
  useI18nStore: () => ({ getLocale: () => 'zh_TW' })
}))

vi.mock('@/router', () => ({
  default: mockRouter
}))

import { HttpError, request } from '@/shared/services/httpClient'

/**
 * httpClient.request
 *
 * 依「請求組裝／錯誤與狀態」分組，對齊 Vitest 巢狀 describe 建議。
 */
describe('httpClient request', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    document.cookie = ''
    vi.stubGlobal('fetch', vi.fn())
    mockRouter.currentRoute.value.path = '/dashboard'
    mockRouter.currentRoute.value.fullPath = '/dashboard?tab=main'
  })

  describe('請求組裝與 token', () => {
    it('後台 path：帶 app headers 與 admin Bearer', async () => {
      const fetchMock = vi.mocked(fetch)
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ success: true, data: { ok: true } }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await request('/api/users')

      expect(fetchMock).toHaveBeenCalledTimes(1)
      const [, options] = fetchMock.mock.calls[0]
      expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer admin-token')
      expect((options?.headers as Record<string, string>)['Accept-Language']).toBe('zh_TW')
      expect((options?.headers as Record<string, string>).UserTimeZone).toBe('Asia/Taipei')
      expect((options?.headers as Record<string, string>)['Replay-key']).toBeTruthy()
      expect(mockLoadingStore.startLoading).toHaveBeenCalledTimes(1)
      expect(mockLoadingStore.finishLoading).toHaveBeenCalledTimes(1)
    })

    it('/api/front path：使用前台 Bearer', async () => {
      const fetchMock = vi.mocked(fetch)
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await request('/api/front/profile')

      const [, options] = fetchMock.mock.calls[0]
      expect((options?.headers as Record<string, string>).Authorization).toBe('Bearer front-token')
    })

    it('skipAppHeaders：不帶語系／時區／Replay-key', async () => {
      const fetchMock = vi.mocked(fetch)
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await request('/api/auth/login', { skipAppHeaders: true, method: 'POST' })

      const [, options] = fetchMock.mock.calls[0]
      const headers = options?.headers as Record<string, string>
      expect(headers['Accept-Language']).toBeUndefined()
      expect(headers.UserTimeZone).toBeUndefined()
      expect(headers['Replay-key']).toBeUndefined()
    })
  })

  describe('回應與 HTTP 狀態', () => {
    it('body success=false：拋 HttpError 並帶訊息', async () => {
      const fetchMock = vi.mocked(fetch)
      fetchMock.mockResolvedValue(
        new Response(JSON.stringify({ success: false, message: 'Business failed' }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )

      await expect(request('/api/users')).rejects.toMatchObject({
        name: 'HttpError',
        status: 200,
        message: 'Business failed'
      } satisfies Partial<HttpError>)
    })

    it('401：清除後台 token 並導向 /login 含 redirect', async () => {
      const fetchMock = vi.mocked(fetch)
      fetchMock.mockResolvedValue(
        new Response('Unauthorized', {
          status: 401,
          headers: { 'content-type': 'text/plain' }
        })
      )

      await expect(request('/api/users')).rejects.toBeInstanceOf(HttpError)
      expect(mockAuthStrategy.remove).toHaveBeenCalledTimes(1)
      expect(mockRouter.replace).toHaveBeenCalledWith({
        path: '/login',
        query: { redirect: '/dashboard?tab=main' }
      })
    })
  })
})
