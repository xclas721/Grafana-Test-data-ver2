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

import { userService } from '@/shared/services/userService'

/**
 * userService：薄包裝 apiClient 與查詢參數轉換（§4.0）。
 */
describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAllUsers', () => {
    it('應 GET /api/users 並回傳 data 陣列', async () => {
      const users = [{ id: 1, username: 'a' }]
      apiClientMock.get.mockResolvedValue({ data: users })

      const result = await userService.getAllUsers()

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/users')
      expect(result).toEqual(users)
    })

    it('data 為 undefined 應回空陣列', async () => {
      apiClientMock.get.mockResolvedValue({})

      const result = await userService.getAllUsers()

      expect(result).toEqual([])
    })
  })

  describe('searchUsers', () => {
    it('應將前端 page 轉為後端 0-based 並帶可選篩選與排序', async () => {
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

      const result = await userService.searchUsers({
        page: 2,
        size: 10,
        name: 'Amy',
        email: 'a@',
        phone: '09',
        sortBy: 'id',
        direction: 'DESC'
      })

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/users/search', {
        page: 1,
        size: 10,
        name: 'Amy',
        email: 'a@',
        phone: '09',
        sortBy: 'id',
        direction: 'DESC'
      })
      expect(result).toEqual(pageData)
    })

    it('未填篩選欄位時不應帶入 query', async () => {
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

      await userService.searchUsers({ page: 1, size: 5 })

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/users/search', {
        page: 0,
        size: 5
      })
    })
  })

  describe('getUserById', () => {
    it('應 GET /api/users/:id 並回傳 data', async () => {
      const vo = { id: 7, username: 'u' }
      apiClientMock.get.mockResolvedValue({ data: vo })

      const result = await userService.getUserById(7)

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/users/7')
      expect(result).toEqual(vo)
    })
  })

  describe('createUser', () => {
    it('應 POST /api/users', async () => {
      const body = { username: 'n', name: 'N', email: 'n@e.com' }
      const vo = { id: 1, ...body }
      apiClientMock.post.mockResolvedValue({ data: vo })

      const result = await userService.createUser(body as any)

      expect(apiClientMock.post).toHaveBeenCalledWith('/api/users', body)
      expect(result).toEqual(vo)
    })
  })

  describe('updateUser', () => {
    it('應 PUT /api/users/:id', async () => {
      const body = { username: 'n', name: 'N', email: 'n@e.com' }
      const vo = { id: 3, ...body }
      apiClientMock.put.mockResolvedValue({ data: vo })

      const result = await userService.updateUser(3, body as any)

      expect(apiClientMock.put).toHaveBeenCalledWith('/api/users/3', body)
      expect(result).toEqual(vo)
    })
  })

  describe('deleteUser', () => {
    it('應 DELETE /api/users/:id', async () => {
      apiClientMock.delete.mockResolvedValue(undefined)

      await userService.deleteUser(9)

      expect(apiClientMock.delete).toHaveBeenCalledWith('/api/users/9')
    })
  })

  describe('exportUsersCsv', () => {
    it('應下載 CSV 並觸發連結點擊', async () => {
      apiClientMock.get.mockResolvedValue('id,name\n1,Amy')

      const click = vi.fn()
      const anchor = { click, href: '', download: '' } as unknown as HTMLAnchorElement
      vi.spyOn(document, 'createElement').mockReturnValue(anchor)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
      const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

      await userService.exportUsersCsv()

      expect(apiClientMock.get).toHaveBeenCalledWith('/api/users/export')
      expect(anchor.download).toBe('users.csv')
      expect(anchor.href).toBe('blob:mock-url')
      expect(click).toHaveBeenCalledOnce()
      expect(revoke).toHaveBeenCalledWith('blob:mock-url')
    })

    it('回傳非字串時應以空字串建立 Blob', async () => {
      apiClientMock.get.mockResolvedValue({ unexpected: true })

      const click = vi.fn()
      const anchor = { click, href: '', download: '' } as unknown as HTMLAnchorElement
      vi.spyOn(document, 'createElement').mockReturnValue(anchor)
      vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:x')

      await userService.exportUsersCsv()

      expect(click).toHaveBeenCalledOnce()
    })
  })
})
