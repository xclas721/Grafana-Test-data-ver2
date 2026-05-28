import type { Router } from 'vue-router'

/**
 * 路由全域 onError 保底：目前不在 /500 時導向 500 頁，避免動態載入失敗白屏。
 * 邏輯與 `router/index.ts` 的 `onError` 一致，抽出後便於單元測試。
 */
export function replaceWith500IfNeeded(router: Router): void {
  if (router.currentRoute.value.path !== '/500') {
    void router.replace('/500')
  }
}
