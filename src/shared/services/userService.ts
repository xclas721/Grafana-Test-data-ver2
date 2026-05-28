// 使用者 API 服務
import { apiClient } from './apiClient'
import type { ApiResult, UserVo, UserRequest } from '@/shared/types'
export type { UserVo, UserRequest } from '@/shared/types'
import type { PageResponse } from '@/shared/utils/pagination'

/**
 * 使用者 API 服務
 */
export const userService = {
  /**
   * 取得所有使用者（無分頁，僅用於少量資料）
   */
  getAllUsers: async (): Promise<UserVo[]> => {
    const result = await apiClient.get<ApiResult<UserVo[]>>('/api/users')
    return result.data || []
  },

  /**
   * 分頁查詢使用者（支援條件查詢和排序）
   * @param params 查詢參數
   */
  searchUsers: async (params: {
    name?: string
    email?: string
    phone?: string
    page: number // 前端從 1 開始
    size: number
    sortBy?: string
    direction?: 'ASC' | 'DESC'
  }): Promise<PageResponse<UserVo>> => {
    // 轉換為後端格式（page 從 0 開始）
    const queryParams: Record<string, any> = {
      page: params.page - 1, // 後端從 0 開始
      size: params.size
    }

    if (params.name) queryParams.name = params.name
    if (params.email) queryParams.email = params.email
    if (params.phone) queryParams.phone = params.phone
    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.direction) queryParams.direction = params.direction

    const result = await apiClient.get<ApiResult<PageResponse<UserVo>>>(
      '/api/users/search',
      queryParams
    )
    return result.data
  },

  /**
   * 根據 ID 取得使用者
   */
  getUserById: async (id: number): Promise<UserVo> => {
    const result = await apiClient.get<ApiResult<UserVo>>(`/api/users/${id}`)
    return result.data
  },

  /**
   * 新增使用者
   */
  createUser: async (request: UserRequest): Promise<UserVo> => {
    const result = await apiClient.post<ApiResult<UserVo>>('/api/users', request)
    return result.data
  },

  /**
   * 更新使用者
   */
  updateUser: async (id: number, request: UserRequest): Promise<UserVo> => {
    const result = await apiClient.put<ApiResult<UserVo>>(`/api/users/${id}`, request)
    return result.data
  },

  /**
   * 刪除使用者
   */
  deleteUser: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/users/${id}`)
  },

  /**
   * 匯出使用者列表為 CSV 並觸發下載
   */
  exportUsersCsv: async (): Promise<void> => {
    const csv = await apiClient.get<string>('/api/users/export')
    const text = typeof csv === 'string' ? csv : ''
    const blob = new Blob([text], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'users.csv'
    a.click()
    URL.revokeObjectURL(url)
  }
}
