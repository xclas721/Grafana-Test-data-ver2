/**
 * 會員相關 API 型別（自 OpenAPI schema 同步，勿手動改）
 */
import type { components } from '@/api/generated/schema'

export type MemberVo = components['schemas']['MemberVo']
export type MemberDto = components['schemas']['MemberDto']
export type MemberRequest = components['schemas']['MemberRequest']
