import { describe, expect, it, vi } from 'vitest'
import type { Router } from 'vue-router'
import { replaceWith500IfNeeded } from '@/shared/router/replaceWith500IfNeeded'

function mockRouter(path: string) {
  const replace = vi.fn().mockResolvedValue(undefined)
  return {
    replace,
    currentRoute: { value: { path } }
  } as unknown as Router
}

describe('replaceWith500IfNeeded', () => {
  describe('目前路徑不是 /500', () => {
    it('應 replace 到 /500', () => {
      const router = mockRouter('/dashboard')
      replaceWith500IfNeeded(router)
      expect(router.replace).toHaveBeenCalledWith('/500')
    })
  })

  describe('目前路徑已是 /500', () => {
    it('不應再次 replace（避免重複導向）', () => {
      const router = mockRouter('/500')
      replaceWith500IfNeeded(router)
      expect(router.replace).not.toHaveBeenCalled()
    })
  })
})
