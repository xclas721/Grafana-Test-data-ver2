/**
 * Token 儲存策略：預設使用 localStorage，可於 app 初始化時替換為 session 或自訂實作。
 * @see docs/權杖儲存策略說明.md
 */
import type { TokenStorageStrategy } from './types'
import { createLocalStorageStrategy } from './localStorageStrategy'
import { createSessionStorageStrategy } from './sessionStorageStrategy'

const AUTH_TOKEN_KEY = 'auth_token'
const FRONT_TOKEN_KEY = 'front_auth_token'

let authStrategy: TokenStorageStrategy = createLocalStorageStrategy(AUTH_TOKEN_KEY)
let frontStrategy: TokenStorageStrategy = createLocalStorageStrategy(FRONT_TOKEN_KEY)

export type { TokenStorageStrategy }
export { createLocalStorageStrategy, createSessionStorageStrategy }

export function getAuthTokenStrategy(): TokenStorageStrategy {
  return authStrategy
}

export function getFrontTokenStrategy(): TokenStorageStrategy {
  return frontStrategy
}

/** 替換後台登入 token 儲存方式（例如改為 sessionStorage）。建議在 main.ts 初始化時呼叫。 */
export function setAuthTokenStrategy(strategy: TokenStorageStrategy): void {
  authStrategy = strategy
}

/** 替換前台登入 token 儲存方式。建議在 main.ts 初始化時呼叫。 */
export function setFrontTokenStrategy(strategy: TokenStorageStrategy): void {
  frontStrategy = strategy
}
