// 系統設定 API 服務
import { apiClient } from './apiClient'
import type { ApiResult } from '@/shared/types'
import type { PageResponse } from '@/shared/utils/pagination'

export interface SystemConfigVo {
  id?: number
  key?: string
  value?: string
  type?: string
  description?: string
}

export interface SystemConfigRequest {
  key: string
  value: string
  type: string
  description?: string
}

export interface SystemConfigUpdateRequest {
  value: string
  type: string
  description?: string
}

/**
 * 系統設定 API 服務（對接後端 /api/system-configs）
 */
export const systemConfigService = {
  /**
   * 分頁搜尋
   */
  search: async (params: {
    key?: string
    type?: string
    page: number
    size: number
    sortBy?: string
    direction?: 'ASC' | 'DESC'
  }): Promise<PageResponse<SystemConfigVo>> => {
    const queryParams: Record<string, string | number> = {
      page: params.page - 1,
      size: params.size
    }
    if (params.key) queryParams.key = params.key
    if (params.type) queryParams.type = params.type
    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.direction) queryParams.direction = params.direction

    const result = await apiClient.get<ApiResult<PageResponse<SystemConfigVo>>>(
      '/api/system-configs/search',
      queryParams
    )
    return result.data
  },

  /**
   * 依 key 查詢單筆
   */
  getByKey: async (key: string): Promise<SystemConfigVo | null> => {
    const result = await apiClient.get<ApiResult<SystemConfigVo>>(
      `/api/system-configs/by-key/${encodeURIComponent(key)}`
    )
    return result.data ?? null
  },

  /**
   * 依 id 查詢單筆
   */
  getById: async (id: number): Promise<SystemConfigVo> => {
    const result = await apiClient.get<ApiResult<SystemConfigVo>>(`/api/system-configs/${id}`)
    return result.data
  },

  /**
   * 新增
   */
  create: async (request: SystemConfigRequest): Promise<SystemConfigVo> => {
    const result = await apiClient.post<ApiResult<SystemConfigVo>>('/api/system-configs', request)
    return result.data
  },

  /**
   * 更新（僅 value / type / description）
   */
  update: async (id: number, request: SystemConfigUpdateRequest): Promise<SystemConfigVo> => {
    const result = await apiClient.put<ApiResult<SystemConfigVo>>(
      `/api/system-configs/${id}`,
      request
    )
    return result.data
  }
}
