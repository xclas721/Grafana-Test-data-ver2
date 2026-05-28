import { describe, expect, it } from 'vitest'
import { parseAdminRoleFromToken, parseFrontRoleFromToken } from '@/shared/utils/authToken'

/** 產生 JWT 第二段（payload）的 base64url，不含 padding。 */
function payloadSegment(payload: Record<string, unknown>): string {
  const json = JSON.stringify(payload)
  const b64 = Buffer.from(json, 'utf8').toString('base64')
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fakeJwt(payload: Record<string, unknown>): string {
  return `e30.${payloadSegment(payload)}.sig`
}

/**
 * JWT payload 角色解析與 demo／front token 前綴（§4.0）。
 */
describe('authToken', () => {
  describe('parseAdminRoleFromToken', () => {
    it('null 或空字串應回 null', () => {
      expect(parseAdminRoleFromToken(null)).toBeNull()
      expect(parseAdminRoleFromToken('')).toBeNull()
    })

    it('JWT payload 為 ADMIN／EDITOR／VIEWER 應回對應角色', () => {
      expect(parseAdminRoleFromToken(fakeJwt({ role: 'ADMIN' }))).toBe('ADMIN')
      expect(parseAdminRoleFromToken(fakeJwt({ role: 'EDITOR' }))).toBe('EDITOR')
      expect(parseAdminRoleFromToken(fakeJwt({ role: 'VIEWER' }))).toBe('VIEWER')
    })

    it('JWT 角色為 MEMBER 或非白名單應回 null', () => {
      expect(parseAdminRoleFromToken(fakeJwt({ role: 'MEMBER' }))).toBeNull()
      expect(parseAdminRoleFromToken(fakeJwt({ role: 'GUEST' }))).toBeNull()
    })

    it('JWT 角色非字串應回 null', () => {
      expect(parseAdminRoleFromToken(fakeJwt({ role: 1 }))).toBeNull()
    })

    it('demo- 與 user- 前綴應視為 ADMIN', () => {
      expect(parseAdminRoleFromToken('demo-token')).toBe('ADMIN')
      expect(parseAdminRoleFromToken('user-1')).toBe('ADMIN')
    })

    it('格式錯誤的 JWT 應回 null', () => {
      expect(parseAdminRoleFromToken('not-a-jwt')).toBeNull()
      expect(parseAdminRoleFromToken('a.b.c.d')).toBeNull()
    })
  })

  describe('parseFrontRoleFromToken', () => {
    it('null 應回 null', () => {
      expect(parseFrontRoleFromToken(null)).toBeNull()
    })

    it('JWT role 為 MEMBER 應回 MEMBER', () => {
      expect(parseFrontRoleFromToken(fakeJwt({ role: 'MEMBER' }))).toBe('MEMBER')
    })

    it('front-demo- 與 front-user- 前綴應回 MEMBER', () => {
      expect(parseFrontRoleFromToken('front-demo-x')).toBe('MEMBER')
      expect(parseFrontRoleFromToken('front-user-1')).toBe('MEMBER')
    })

    it('後台 JWT 不應誤判為前台角色', () => {
      expect(parseFrontRoleFromToken(fakeJwt({ role: 'ADMIN' }))).toBeNull()
    })
  })
})
