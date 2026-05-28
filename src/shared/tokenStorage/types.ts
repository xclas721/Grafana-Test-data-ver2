/**
 * Token 儲存策略介面：可替換為 localStorage / sessionStorage / cookie 等實作，
 * 以因應不同安全需求（例如高敏感改為 session 或 httpOnly cookie）。
 */
export interface TokenStorageStrategy {
  get(): string | null
  set(value: string): void
  remove(): void
}
