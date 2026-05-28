import { httpClient } from './httpClient'
import type { ApiResult, AuthLoginRequest, AuthLoginResponse } from '@/shared/types'
export type { AuthLoginRequest, AuthLoginResponse }

export interface LoginErrorI18n {
  key: string
  params?: Record<string, string | number>
}

/** 從登入錯誤推導 i18n key 與參數，供頁面以 t(key, params) 顯示。 */
export function getLoginErrorMessage(error: unknown): LoginErrorI18n {
  const obj = error && typeof error === 'object' ? (error as Record<string, unknown>) : null
  const status = obj && 'status' in obj ? Number(obj.status) : undefined
  const msg = obj && 'message' in obj ? String(obj.message) : ''

  if (status === 401) return { key: 'auth.error.401' }
  if (error instanceof TypeError || msg.includes('Failed to fetch'))
    return { key: 'auth.error.network' }
  if (msg.includes('timeout')) return { key: 'auth.error.timeout' }
  if (typeof status === 'number' && Number.isFinite(status))
    return { key: 'auth.error.http', params: { status } }
  if (msg) return { key: 'auth.error.withMessage', params: { msg } }
  return { key: 'auth.error.unexpected' }
}

export const authService = {
  /** 後台登入 */
  login: async (payload: AuthLoginRequest): Promise<AuthLoginResponse> => {
    const result = await httpClient.post<ApiResult<AuthLoginResponse>>('/api/auth/login', payload, {
      skipAppHeaders: true
    })
    return result.data
  },
  /** 前台會員登入（獨立 token 與 API） */
  frontLogin: async (payload: AuthLoginRequest): Promise<AuthLoginResponse> => {
    const result = await httpClient.post<ApiResult<AuthLoginResponse>>(
      '/api/front/auth/login',
      payload,
      { skipAppHeaders: true }
    )
    return result.data
  },
  getLoginErrorMessage
}
