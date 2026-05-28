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

import { memberService } from '@/shared/services/memberService'

/**
 * memberService：薄包裝 apiClient 與查詢參數轉換（§4.0）。
 */
describe('memberService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllMembers', () => {
    it('應 GET /api/members 並回傳 data', async () => {
      const list = [{ id: 1, username: 'm' }]
      apiClientMock.get.mockResolvedValue({ data: list })

      expect(await memberService.getAllMembers()).toEqual(list)
      expect(apiClientMock.get).toHaveBeenCalledWith('/api/members')
    })

    it('data 缺漏應回 []', async () => {
      apiClientMock.get.mockResolvedValue({})
      expect(await memberService.getAllMembers()).toEqual([])
    })
  })

  describe('searchMembers', () => {
    it('應轉 page 並帶完整 query', async () => {
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

      await memberService.searchMembers({
        page: 3,
        size: 20,
        name: 'x',
        email: 'y',
        phone: 'z',
        sortBy: 'name',
        direction: 'ASC'
      })

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/members/search', {
        page: 2,
        size: 20,
        name: 'x',
        email: 'y',
        phone: 'z',
        sortBy: 'name',
        direction: 'ASC'
      })
    })
  })

  describe('getMemberById', () => {
    it('應 GET /api/members/:id', async () => {
      const vo = { id: 5 }
      apiClientMock.get.mockResolvedValue({ data: vo })
      expect(await memberService.getMemberById(5)).toEqual(vo)
      expect(apiClientMock.get).toHaveBeenCalledWith('/api/members/5')
    })
  })

  describe('createMember', () => {
    it('應 POST /api/members', async () => {
      const req = { username: 'a', name: 'A', email: 'a@b.c' }
      const vo = { id: 1, ...req }
      apiClientMock.post.mockResolvedValue({ data: vo })
      expect(await memberService.createMember(req as any)).toEqual(vo)
      expect(apiClientMock.post).toHaveBeenCalledWith('/api/members', req)
    })
  })

  describe('updateMember', () => {
    it('應 PUT /api/members/:id', async () => {
      const req = { username: 'a', name: 'A', email: 'a@b.c' }
      const vo = { id: 2, ...req }
      apiClientMock.put.mockResolvedValue({ data: vo })
      expect(await memberService.updateMember(2, req as any)).toEqual(vo)
      expect(apiClientMock.put).toHaveBeenCalledWith('/api/members/2', req)
    })
  })

  describe('deleteMember', () => {
    it('應 DELETE /api/members/:id', async () => {
      apiClientMock.delete.mockResolvedValue(undefined)
      await memberService.deleteMember(8)
      expect(apiClientMock.delete).toHaveBeenCalledWith('/api/members/8')
    })
  })
})
