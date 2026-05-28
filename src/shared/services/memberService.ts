// 會員 API 服務
import { apiClient } from './apiClient'
import type { ApiResult, MemberVo, MemberRequest } from '@/shared/types'
export type { MemberVo, MemberRequest } from '@/shared/types'
import type { PageResponse } from '@/shared/utils/pagination'

/**
 * 會員 API 服務
 */
export const memberService = {
  getAllMembers: async (): Promise<MemberVo[]> => {
    const result = await apiClient.get<ApiResult<MemberVo[]>>('/api/members')
    return result.data || []
  },

  searchMembers: async (params: {
    name?: string
    email?: string
    phone?: string
    page: number
    size: number
    sortBy?: string
    direction?: 'ASC' | 'DESC'
  }): Promise<PageResponse<MemberVo>> => {
    const queryParams: Record<string, any> = {
      page: params.page - 1,
      size: params.size
    }
    if (params.name) queryParams.name = params.name
    if (params.email) queryParams.email = params.email
    if (params.phone) queryParams.phone = params.phone
    if (params.sortBy) queryParams.sortBy = params.sortBy
    if (params.direction) queryParams.direction = params.direction

    const result = await apiClient.get<ApiResult<PageResponse<MemberVo>>>(
      '/api/members/search',
      queryParams
    )
    return result.data
  },

  getMemberById: async (id: number): Promise<MemberVo> => {
    const result = await apiClient.get<ApiResult<MemberVo>>(`/api/members/${id}`)
    return result.data
  },

  createMember: async (request: MemberRequest): Promise<MemberVo> => {
    const result = await apiClient.post<ApiResult<MemberVo>>('/api/members', request)
    return result.data
  },

  updateMember: async (id: number, request: MemberRequest): Promise<MemberVo> => {
    const result = await apiClient.put<ApiResult<MemberVo>>(`/api/members/${id}`, request)
    return result.data
  },

  deleteMember: async (id: number): Promise<void> => {
    await apiClient.delete(`/api/members/${id}`)
  }
}
