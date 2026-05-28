import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useFrontAuthStore } from '@/stores/frontAuth'
import { setFrontTokenStrategy, type TokenStorageStrategy } from '@/shared/tokenStorage'

const createMockStrategy = (): TokenStorageStrategy => ({
  get: vi.fn(() => null),
  set: vi.fn(),
  remove: vi.fn()
})

/**
 * frontAuth store
 *
 * 巢狀 describe：報表階層與行為分組一致（Vitest 官方建議之組織方式）。
 */
describe('frontAuth store', () => {
  let strategy: TokenStorageStrategy

  beforeEach(() => {
    setActivePinia(createPinia())
    strategy = createMockStrategy()
    setFrontTokenStrategy(strategy)
  })

  describe('初始狀態', () => {
    it('未登入：token、role 為空，isAuthenticated 為 false', () => {
      const store = useFrontAuthStore()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
    })
  })

  describe('setToken', () => {
    it('demo 前綴：解析為 MEMBER、持久化、isAuthenticated 為 true', () => {
      const store = useFrontAuthStore()
      store.setToken('front-user-abc')

      expect(store.token).toBe('front-user-abc')
      expect(store.role).toBe('MEMBER')
      expect(store.isAuthenticated).toBe(true)
      expect(strategy.set).toHaveBeenCalledWith('front-user-abc')
    })

    it('JWT payload role=MEMBER：role 為 MEMBER', () => {
      const store = useFrontAuthStore()
      const memberJwt = `a.${btoa(JSON.stringify({ role: 'MEMBER' }))}.c`
      store.setToken(memberJwt)
      expect(store.role).toBe('MEMBER')
      expect(store.isAuthenticated).toBe(true)
    })

    it('設為 null：清除並呼叫策略 remove', () => {
      const store = useFrontAuthStore()
      store.setToken('front-user-abc')
      store.setToken(null)

      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(strategy.remove).toHaveBeenCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('應清除 token（等同 setToken(null)）', () => {
      const store = useFrontAuthStore()
      store.setToken('front-demo-1')
      store.logout()

      expect(store.token).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(strategy.remove).toHaveBeenCalled()
    })
  })
})
