import { appConfig } from '@/shared/config/appConfig'
import { getAuthTokenStrategy, getFrontTokenStrategy } from '@/shared/tokenStorage'
import { useLoadingStore } from '@/stores/loading'
import { useAppStore } from '@/stores/app'
import { useI18nStore } from '@/stores/i18n'
import router from '@/router'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequestOptions {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: any
  timeoutMs?: number
  /** 為 true 時不帶業務 headers（時區、語系、Replay-key 等），用於登入、health 等 */
  skipAppHeaders?: boolean
  /** GET 用：會轉成 query string 接到 path 後 */
  params?: Record<string, any>
}

function generateRandomValues(): string {
  const timestamp = Date.now()
  const nonce =
    (crypto as any)?.randomUUID?.() ??
    Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
  return `${timestamp}:${nonce}`
}

/** 業務用 headers（時區、語系、Replay-key、XSRF），須在 Pinia 掛載後呼叫 */
function getAppHeaders(): Record<string, string> {
  const appStore = useAppStore()
  const i18nStore = useI18nStore()
  const xsrf = document.cookie.includes('XSRF-TOKEN')
    ? document.cookie
        .split('; ')
        .find((row) => row.startsWith('XSRF-TOKEN='))
        ?.split('=')[1] || ''
    : ''
  return {
    UserTimeZone: appStore.timeZone,
    'Accept-Language': i18nStore.getLocale(),
    'Replay-key': generateRandomValues(),
    ...(xsrf ? { 'X-XSRF-TOKEN': xsrf } : {})
  }
}

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

const isJsonResponse = (contentType: string | null) =>
  contentType?.includes('application/json') ?? false

const buildUrl = (path: string) => {
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const prefix = appConfig.API_BASE_URL?.replace(/\/$/, '') ?? ''
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${prefix}${normalized}`
}

/** 依 path 取得對應的 token（後台用 getAuthTokenStrategy、前台用 getFrontTokenStrategy） */
const getAuthToken = (path: string) =>
  path.startsWith('/api/front') ? getFrontTokenStrategy().get() : getAuthTokenStrategy().get()

const routeByStatus = (status: number) => {
  const currentPath = router.currentRoute.value.path
  if (status === 401 && currentPath !== '/login' && currentPath !== '/front/login') {
    const isFront = currentPath.startsWith('/front')
    if (isFront) {
      getFrontTokenStrategy().remove()
    } else {
      getAuthTokenStrategy().remove()
    }
    const loginPath = isFront ? '/front/login' : '/login'
    void router.replace({
      path: loginPath,
      query: { redirect: router.currentRoute.value.fullPath }
    })
    return
  }

  if (status >= 500 && router.currentRoute.value.path !== '/500') {
    void router.replace('/500')
  }
}

// 請求佇列追蹤
const activeRequests = new Set<symbol>()

/**
 * 包裝請求，確保正確管理 loading 狀態
 */
async function wrapRequest<T>(requestPromise: Promise<T>): Promise<T> {
  const requestId = Symbol()
  const loadingStore = useLoadingStore()

  try {
    activeRequests.add(requestId)
    if (activeRequests.size === 1) {
      // 第一個請求時開始 loading
      loadingStore.startLoading()
    }

    const result = await requestPromise
    return result
  } finally {
    activeRequests.delete(requestId)
    if (activeRequests.size === 0) {
      // 所有請求完成時結束 loading
      loadingStore.finishLoading()
    }
  }
}

export async function request<T = any>(path: string, options: HttpRequestOptions = {}) {
  const controller = new AbortController()
  const timeoutMs = options.timeoutMs ?? appConfig.BACKEND_API_TIMEOUT ?? 60000
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs)

  const query =
    options.params && Object.keys(options.params).length > 0
      ? '?' + new URLSearchParams(options.params).toString()
      : ''
  const url = buildUrl(path) + query

  const token = getAuthToken(path)
  const baseHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.skipAppHeaders !== true ? getAppHeaders() : {}),
    ...(options.headers ?? {})
  }

  const requestPromise = (async () => {
    try {
      const response = await fetch(url, {
        method: options.method ?? 'GET',
        headers: baseHeaders,
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: controller.signal
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => '')
        routeByStatus(response.status)
        throw new HttpError(response.status, errorText || `HTTP ${response.status}`)
      }

      if (isJsonResponse(response.headers.get('content-type'))) {
        const data = await response.json()
        // 後端若回 200 但 body 為 Result { success: false }，視為錯誤並拋出，方便各頁 catch 顯示 toast
        if (
          typeof data === 'object' &&
          data !== null &&
          'success' in data &&
          (data as { success?: boolean }).success === false
        ) {
          const body = data as { message?: string; code?: string; correlationId?: string }
          const msg = body.message || body.code || 'Request failed'
          throw new HttpError(response.status, typeof msg === 'string' ? msg : 'Request failed')
        }
        return data as T
      }

      return (await response.text()) as T
    } finally {
      window.clearTimeout(timeoutId)
    }
  })()

  try {
    return await wrapRequest(requestPromise)
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeoutMs}ms`, { cause: error })
    }
    throw error
  }
}

export const httpClient = {
  get: <T = any>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'GET' }),
  post: <T = any>(path: string, body?: any, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'POST', body }),
  put: <T = any>(path: string, body?: any, options?: Omit<HttpRequestOptions, 'method'>) =>
    request<T>(path, { ...options, method: 'PUT', body }),
  delete: <T = any>(path: string, options?: Omit<HttpRequestOptions, 'method' | 'body'>) =>
    request<T>(path, { ...options, method: 'DELETE' })
}
