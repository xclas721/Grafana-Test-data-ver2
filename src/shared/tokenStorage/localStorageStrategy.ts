import type { TokenStorageStrategy } from './types'

export function createLocalStorageStrategy(key: string): TokenStorageStrategy {
  return {
    get() {
      try {
        return localStorage.getItem(key)
      } catch {
        return null
      }
    },
    set(value: string) {
      try {
        localStorage.setItem(key, value)
      } catch {
        // quota exceeded or disabled
      }
    },
    remove() {
      try {
        localStorage.removeItem(key)
      } catch {
        // ignore
      }
    }
  }
}
