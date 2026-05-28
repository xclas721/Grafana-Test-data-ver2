// 應用程式公開設定值

export type PublicConfigNames =
  | 'API_BASE_URL'
  | 'FRONTEND_CONTEXT_PATH'
  | 'FRONTEND_PORT'
  | 'BACKEND_API_TIMEOUT'
  | 'PAGE_SIZE'
  | 'STAGE'
  | 'SYSTEM_ID'
  | 'BACKEND_CONTEXT_PATH'

export type PublicConfig = Record<PublicConfigNames, any>

declare global {
  interface Window {
    __APP_CONFIG__?: Partial<PublicConfig>
  }
}

const runtime = window.__APP_CONFIG__ ?? {}

export const appConfig: PublicConfig = {
  API_BASE_URL:
    runtime.API_BASE_URL ?? import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080',
  FRONTEND_CONTEXT_PATH:
    runtime.FRONTEND_CONTEXT_PATH ?? import.meta.env.VITE_FRONTEND_CONTEXT_PATH ?? '/',
  FRONTEND_PORT: runtime.FRONTEND_PORT ?? import.meta.env.VITE_FRONTEND_PORT ?? '3000',
  BACKEND_API_TIMEOUT: Number(
    runtime.BACKEND_API_TIMEOUT ?? import.meta.env.VITE_BACKEND_API_TIMEOUT ?? 60000
  ),
  PAGE_SIZE: Number(runtime.PAGE_SIZE ?? import.meta.env.VITE_PAGE_SIZE ?? 10),
  STAGE: runtime.STAGE ?? import.meta.env.MODE ?? 'dev',
  SYSTEM_ID: runtime.SYSTEM_ID ?? import.meta.env.VITE_SYSTEM_ID ?? 'Brainwave',
  BACKEND_CONTEXT_PATH:
    runtime.BACKEND_CONTEXT_PATH ?? import.meta.env.VITE_BACKEND_CONTEXT_PATH ?? ''
}
