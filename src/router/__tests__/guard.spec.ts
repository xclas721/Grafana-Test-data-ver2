import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/locales', () => ({
  default: {
    global: {
      t: (key: string) => key
    }
  }
}))

import router from '@/router'

describe('router (frontend-only)', () => {
  beforeAll(async () => {
    await router.push('/')
    await router.isReady()
  })

  beforeEach(async () => {
    await router.push('/')
  })

  describe('no auth guard', () => {
    it('可直接進入 /dashboard', async () => {
      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/dashboard')
    })
  })

  describe('removed backend routes', () => {
    it('訪問 /users 會導向 /404', async () => {
      await router.push('/users')
      expect(router.currentRoute.value.path).toBe('/404')
    })

    it('訪問 /front/login 會導向 /404', async () => {
      await router.push('/front/login')
      expect(router.currentRoute.value.path).toBe('/404')
    })
  })
})
