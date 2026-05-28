import { beforeEach, describe, expect, it, vi } from 'vitest'

const { httpClientMock } = vi.hoisted(() => ({
  httpClientMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/shared/services/httpClient', () => ({
  httpClient: httpClientMock
}))

import { apiClient } from '@/shared/services/apiClient'

/**
 * apiClient：薄包裝 httpClient，僅轉發參數與錯誤。
 * 結構：依 HTTP 方法分組（§4.0）。
 */
describe('apiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('GET', () => {
    it('應轉發 path、params 與 headers', async () => {
      httpClientMock.get.mockResolvedValue({ success: true })

      await apiClient.get('/api/users/search', { name: 'amy' }, { 'X-Test': '1' })

      expect(httpClientMock.get).toHaveBeenCalledWith('/api/users/search', {
        params: { name: 'amy' },
        headers: { 'X-Test': '1' }
      })
    })
  })

  describe('POST', () => {
    it('應轉發 body 與 headers', async () => {
      httpClientMock.post.mockResolvedValue({ success: true })

      await apiClient.post('/api/system-configs', { key: 'SITE_TITLE' }, { 'X-Test': '1' })

      expect(httpClientMock.post).toHaveBeenCalledWith(
        '/api/system-configs',
        { key: 'SITE_TITLE' },
        { headers: { 'X-Test': '1' } }
      )
    })
  })

  describe('PUT', () => {
    it('應轉發 body 與 headers', async () => {
      httpClientMock.put.mockResolvedValue({ success: true })

      await apiClient.put('/api/system-configs/1', { value: 'BW' }, { 'X-Test': '1' })

      expect(httpClientMock.put).toHaveBeenCalledWith(
        '/api/system-configs/1',
        { value: 'BW' },
        { headers: { 'X-Test': '1' } }
      )
    })
  })

  describe('DELETE', () => {
    it('應僅轉發 path 與 headers', async () => {
      httpClientMock.delete.mockResolvedValue({ success: true })

      await apiClient.delete('/api/system-configs/1', { 'X-Test': '1' })

      expect(httpClientMock.delete).toHaveBeenCalledWith('/api/system-configs/1', {
        headers: { 'X-Test': '1' }
      })
    })
  })

  describe('錯誤傳遞', () => {
    it('應將 httpClient 錯誤原樣上拋', async () => {
      const error = new Error('network fail')
      httpClientMock.get.mockRejectedValue(error)

      await expect(apiClient.get('/api/users')).rejects.toThrow('network fail')
    })
  })
})
