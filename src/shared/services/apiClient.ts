// 薄包裝：轉成與呼叫端相容的 API，底層由 httpClient 統一處理（含業務 headers、params）
import { httpClient } from './httpClient'

export const apiClient = {
  get: <T = any>(path: string, params?: Record<string, any>, headers?: Record<string, string>) =>
    httpClient.get<T>(path, { params, headers }),

  post: <T = any>(path: string, data?: any, headers?: Record<string, string>) =>
    httpClient.post<T>(path, data, { headers }),

  put: <T = any>(path: string, data?: any, headers?: Record<string, string>) =>
    httpClient.put<T>(path, data, { headers }),

  delete: <T = any>(path: string, headers?: Record<string, string>) =>
    httpClient.delete<T>(path, { headers })
}
