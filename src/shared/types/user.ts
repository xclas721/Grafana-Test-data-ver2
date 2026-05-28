/**
 * 使用者相關 API 型別（自 OpenAPI schema 同步，勿手動改）
 */
import type { components } from '@/api/generated/schema'

export type UserVo = components['schemas']['UserVo']
export type UserDto = components['schemas']['UserDto']
export type UserRequest = components['schemas']['UserRequest']
export type UserUpdateRequest = components['schemas']['UserUpdateRequest']
