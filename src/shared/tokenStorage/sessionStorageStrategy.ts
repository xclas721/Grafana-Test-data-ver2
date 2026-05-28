import type { TokenStorageStrategy } from './types'

export function createSessionStorageStrategy(key: string): TokenStorageStrategy {
  return {
    get() {
      try {
        return sessionStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(value: string) {
      try {
        sessionStorage.setItem(key, value)
      } catch {
        // quota exceeded or disabled
      }
    },
    remove() {
      try {
        sessionStorage.removeItem(key)
      } catch {
        // ignore
      }
    }
  }
}
