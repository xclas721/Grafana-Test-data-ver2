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

  it('根路由會導向 /test-data/input', async () => {
    await router.push('/')
    expect(router.currentRoute.value.path).toBe('/test-data/input')
  })

  describe('removed showcase routes', () => {
    it('訪問 /dashboard 會導向 /404', async () => {
      await router.push('/dashboard')
      expect(router.currentRoute.value.path).toBe('/404')
    })

    it('訪問 /components 會導向 /404', async () => {
      await router.push('/components')
      expect(router.currentRoute.value.path).toBe('/404')
    })
  })
})
