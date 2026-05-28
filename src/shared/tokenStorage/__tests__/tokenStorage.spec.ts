import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  createLocalStorageStrategy,
  createSessionStorageStrategy,
  getAuthTokenStrategy,
  getFrontTokenStrategy,
  setAuthTokenStrategy,
  setFrontTokenStrategy
} from '@/shared/tokenStorage'

/**
 * Token 儲存策略：localStorage／sessionStorage 與模組層替換（§4.0）。
 */
describe('tokenStorage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setAuthTokenStrategy(createLocalStorageStrategy('auth_token'))
    setFrontTokenStrategy(createLocalStorageStrategy('front_auth_token'))
    localStorage.clear()
    sessionStorage.clear()
  })

  describe('createLocalStorageStrategy', () => {
    it('get／set／remove 應讀寫指定 key', () => {
      const s = createLocalStorageStrategy('my-key')
      expect(s.get()).toBeNull()
      s.set('abc')
      expect(localStorage.getItem('my-key')).toBe('abc')
      expect(s.get()).toBe('abc')
      s.remove()
      expect(localStorage.getItem('my-key')).toBeNull()
      expect(s.get()).toBeNull()
    })

    it('getItem 拋錯時應回 null', () => {
      const s = createLocalStorageStrategy('k')
      vi.spyOn(window.localStorage, 'getItem').mockImplementation(() => {
        throw new Error('disabled')
      })
      expect(s.get()).toBeNull()
    })

    it('setItem 拋錯時應不向外拋出', () => {
      const s = createLocalStorageStrategy('k')
      vi.spyOn(window.localStorage, 'setItem').mockImplementation(() => {
        throw new Error('quota')
      })
      expect(() => s.set('x')).not.toThrow()
    })

    it('removeItem 拋錯時應不向外拋出', () => {
      const s = createLocalStorageStrategy('k')
      vi.spyOn(window.localStorage, 'removeItem').mockImplementation(() => {
        throw new Error('x')
      })
      expect(() => s.remove()).not.toThrow()
    })
  })

  describe('createSessionStorageStrategy', () => {
    it('get／set／remove 應讀寫 sessionStorage', () => {
      const s = createSessionStorageStrategy('sess-key')
      s.set('t1')
      expect(sessionStorage.getItem('sess-key')).toBe('t1')
      expect(s.get()).toBe('t1')
      s.remove()
      expect(s.get()).toBeNull()
    })

    it('getItem 拋錯時應回 null', () => {
      const s = createSessionStorageStrategy('k')
      vi.spyOn(window.sessionStorage, 'getItem').mockImplementation(() => {
        throw new Error('disabled')
      })
      expect(s.get()).toBeNull()
    })
  })

  describe('模組預設策略與 setAuthTokenStrategy／setFrontTokenStrategy', () => {
    it('預設後台策略應使用 localStorage 的 auth_token', () => {
      localStorage.setItem('auth_token', 'admin-jwt')
      expect(getAuthTokenStrategy().get()).toBe('admin-jwt')
    })

    it('預設前台策略應使用 localStorage 的 front_auth_token', () => {
      localStorage.setItem('front_auth_token', 'front-jwt')
      expect(getFrontTokenStrategy().get()).toBe('front-jwt')
    })

    it('替換為 session 後應讀寫 sessionStorage', () => {
      setAuthTokenStrategy(createSessionStorageStrategy('auth_token'))
      getAuthTokenStrategy().set('s-token')
      expect(sessionStorage.getItem('auth_token')).toBe('s-token')
      expect(localStorage.getItem('auth_token')).toBeNull()
      expect(getAuthTokenStrategy().get()).toBe('s-token')
    })

    it('可獨立替換前台策略', () => {
      setFrontTokenStrategy(createSessionStorageStrategy('front_auth_token'))
      getFrontTokenStrategy().set('f')
      expect(sessionStorage.getItem('front_auth_token')).toBe('f')
      expect(getFrontTokenStrategy().get()).toBe('f')
    })
  })
})
