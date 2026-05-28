import { beforeEach, describe, expect, it, vi } from 'vitest'

const { apiClientMock } = vi.hoisted(() => ({
  apiClientMock: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
  }
}))

vi.mock('@/shared/services/apiClient', () => ({
  apiClient: apiClientMock
}))

import { systemConfigService } from '@/shared/services/systemConfigService'

/**
 * systemConfigService：薄包裝 apiClient（§4.0）。
 */
describe('systemConfigService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('search', () => {
    it('應轉 page 並帶 key／type／排序', async () => {
      const pageData = {
        content: [],
        currentPage: 0,
        pageSize: 10,
        totalItems: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
        first: true,
        last: true
      }
      apiClientMock.get.mockResolvedValue({ data: pageData })

      await systemConfigService.search({
        page: 2,
        size: 10,
        key: 'SITE',
        type: 'STRING',
        sortBy: 'key',
        direction: 'ASC'
      })

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/system-configs/search', {
        page: 1,
        size: 10,
        key: 'SITE',
        type: 'STRING',
        sortBy: 'key',
        direction: 'ASC'
      })
    })

    it('未填 key／type 時不應帶入', async () => {
      const pageData = {
        content: [],
        currentPage: 0,
        pageSize: 5,
        totalItems: 0,
        totalPages: 0,
        hasPrevious: false,
        hasNext: false,
        first: true,
        last: true
      }
      apiClientMock.get.mockResolvedValue({ data: pageData })

      await systemConfigService.search({ page: 1, size: 5 })

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/system-configs/search', {
        page: 0,
        size: 5
      })
    })
  })

  describe('getByKey', () => {
    it('應 encode key 並回傳 data', async () => {
      const vo = { key: 'a/b', value: 'v' }
      apiClientMock.get.mockResolvedValue({ data: vo })

      const result = await systemConfigService.getByKey('a/b')

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/system-configs/by-key/a%2Fb')
      expect(result).toEqual(vo)
    })

    it('data 為 undefined 應回 null', async () => {
      apiClientMock.get.mockResolvedValue({})
      expect(await systemConfigService.getByKey('x')).toBeNull()
    })
  })

  describe('getById', () => {
    it('應 GET /api/system-configs/:id', async () => {
      const vo = { id: 1, key: 'K' }
      apiClientMock.get.mockResolvedValue({ data: vo })
      expect(await systemConfigService.getById(1)).toEqual(vo)
      expect(apiClientMock.get).toHaveBeenCalledWith('/api/system-configs/1')
    })
  })

  describe('create', () => {
    it('應 POST /api/system-configs', async () => {
      const req = { key: 'K', value: 'v', type: 'STRING' }
      const vo = { id: 9, ...req }
      apiClientMock.post.mockResolvedValue({ data: vo })
      expect(await systemConfigService.create(req)).toEqual(vo)
      expect(apiClientMock.post).toHaveBeenCalledWith('/api/system-configs', req)
    })
  })

  describe('update', () => {
    it('應 PUT /api/system-configs/:id', async () => {
      const req = { value: 'v2', type: 'JSON' }
      const vo = { id: 3, key: 'K', ...req }
      apiClientMock.put.mockResolvedValue({ data: vo })
      expect(await systemConfigService.update(3, req)).toEqual(vo)
      expect(apiClientMock.put).toHaveBeenCalledWith('/api/system-configs/3', req)
    })
  })
})
