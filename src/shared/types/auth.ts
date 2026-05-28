/**
 * 登入相關 API 型別（自 OpenAPI schema 同步，勿手動改）
 */
import type { components } from '@/api/generated/schema'

export type AuthLoginRequest = components['schemas']['AuthLoginRequest']
export type AuthLoginResponse = components['schemas']['AuthLoginResponse']
