import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { authState, frontAuthState } = vi.hoisted(() => ({
  authState: { isAuthenticated: false },
  frontAuthState: { isAuthenticated: false }
}))

vi.mock('@/stores/auth', () => ({
  useAuthStore: () => authState
}))

vi.mock('@/stores/frontAuth', () => ({
  useFrontAuthStore: () => frontAuthState
}))

vi.mock('@/locales', () => ({
  default: {
    global: {
      t: (key: string) => key
    }
  }
}))

import router from '@/router'

/**
 * router beforeEach 守衛
 *
 * 以巢狀 describe 對齊 Vitest 建議：報表呈現階層，情境寫在 describe 名稱與 it 標題即可。
 */
describe('router guard', () => {
  beforeAll(async () => {
    await router.push('/')
    await router.isReady()
  })

  beforeEach(async () => {
    authState.isAuthenticated = false
    frontAuthState.isAuthenticated = false
    await router.push('/')
  })

  describe('後台需登入路由', () => {
    it('未登入：自 /dashboard 導向 /login 並帶 redirect', async () => {
      await router.push('/dashboard')

      expect(router.currentRoute.value.path).toBe('/login')
      expect(router.currentRoute.value.query.redirect).toBe('/dashboard')
    })

    it('已登入：可進入 /users', async () => {
      authState.isAuthenticated = true

      await router.push('/users')

      expect(router.currentRoute.value.path).toBe('/users')
    })
  })

  describe('前台需登入路由', () => {
    it('未登入：自 /front 導向 /front/login 並帶 redirect', async () => {
      await router.push('/front')

      expect(router.currentRoute.value.path).toBe('/front/login')
      expect(router.currentRoute.value.query.redirect).toBe('/front')
    })

    it('已登入：可進入 /front', async () => {
      frontAuthState.isAuthenticated = true

      await router.push('/front')

      expect(router.currentRoute.value.path).toBe('/front')
    })
  })
})
