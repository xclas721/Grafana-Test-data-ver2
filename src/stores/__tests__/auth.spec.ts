import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { setAuthTokenStrategy, type TokenStorageStrategy } from '@/shared/tokenStorage'

const createMockStrategy = (): TokenStorageStrategy => ({
  get: vi.fn(() => null),
  set: vi.fn(),
  remove: vi.fn()
})

/**
 * auth store（後台）
 *
 * 巢狀 describe：與 frontAuth、guard 測試一致，報表可讀（§4.0）。
 */
describe('auth store', () => {
  let strategy: TokenStorageStrategy

  beforeEach(() => {
    setActivePinia(createPinia())
    strategy = createMockStrategy()
    setAuthTokenStrategy(strategy)
  })

  describe('初始狀態', () => {
    it('未登入：token 與 role 為空', () => {
      const store = useAuthStore()
      expect(store.isAuthenticated).toBe(false)
      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
    })
  })

  describe('setToken', () => {
    it('demo/user 前綴：解析為 ADMIN 並呼叫策略 set', () => {
      const store = useAuthStore()
      store.setToken('user-1-xyz')

      expect(store.token).toBe('user-1-xyz')
      expect(store.role).toBe('ADMIN')
      expect(store.isAuthenticated).toBe(true)
      expect(strategy.set).toHaveBeenCalledWith('user-1-xyz')
    })

    it('設為 null：清除 role 並呼叫策略 remove', () => {
      const store = useAuthStore()
      store.setToken('user-1-xyz')
      store.setToken(null)

      expect(store.token).toBeNull()
      expect(store.role).toBeNull()
      expect(store.isAuthenticated).toBe(false)
      expect(strategy.remove).toHaveBeenCalledTimes(1)
    })
  })

  describe('logout', () => {
    it('清除 token 與 user', () => {
      const store = useAuthStore()
      store.setToken('user-1-xyz')
      store.setUser({ name: 'Demo', email: 'demo@example.com' })

      store.logout()

      expect(store.token).toBeNull()
      expect(store.user).toBeNull()
      expect(store.isAuthenticated).toBe(false)
    })
  })

  describe('權限旗標', () => {
    it('依 JWT role 決定 canEdit / canDelete', () => {
      const store = useAuthStore()

      store.setToken('user-1-xyz')
      expect(store.canEdit).toBe(true)
      expect(store.canDelete).toBe(true)

      const editorJwt = `a.${btoa(JSON.stringify({ role: 'EDITOR' }))}.c`
      store.setToken(editorJwt)
      expect(store.canEdit).toBe(true)
      expect(store.canDelete).toBe(false)
    })
  })
})
