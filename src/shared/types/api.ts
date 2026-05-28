/**
 * 後端統一回應格式（與 Spring Boot Result<T> 對齊）
 */
export interface ApiResult<T> {
  success: boolean
  code: string
  message: string
  data: T
  timestamp: string
}
