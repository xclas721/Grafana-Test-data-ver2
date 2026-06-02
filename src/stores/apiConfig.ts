/**
 * API 網域／基礎 URL 共用設定
 *
 * 留空時：使用相對路徑 (/acs-auth、/acs-auth-web)，需由 proxy 轉發
 * - 開發：Vite dev server proxy (vite.config.ts)
 * - 部署：nginx 等反向代理，或 .env 建置時預設
 *
 * 部署預設值：設定 VITE_ACS_AUTH_BASE、VITE_ACS_AUTH_WEB_BASE
 */
import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

const envAcsAuth = import.meta.env.VITE_ACS_AUTH_BASE ?? ''
const envAcsAuthWeb = import.meta.env.VITE_ACS_AUTH_WEB_BASE ?? ''

export const useApiConfigStore = defineStore('apiConfig', () => {
  /** acs-auth 基礎 URL (port 30100)，留空使用相對路徑 */
  const acsAuthBase = ref(envAcsAuth)
  /** acs-auth-web 基礎 URL (port 8050)，留空使用相對路徑 */
  const acsAuthWebBase = ref(envAcsAuthWeb)

  const acsAuthBaseTrimmed = computed(() => acsAuthBase.value.trim())
  const acsAuthWebBaseTrimmed = computed(() => acsAuthWebBase.value.trim())

  /** 取得完整 acs-auth 路徑 */
  function resolveAcsAuthPath(path: string): string {
    const base = acsAuthBaseTrimmed.value
    const p = path.startsWith('/') ? path : `/${path}`
    return base ? `${base.replace(/\/+$/, '')}${p}` : p
  }

  /** 取得完整 acs-auth-web 路徑 */
  function resolveAcsAuthWebPath(path: string): string {
    const base = acsAuthWebBaseTrimmed.value
    const p = path.startsWith('/') ? path : `/${path}`
    return base ? `${base.replace(/\/+$/, '')}${p}` : p
  }

  function loadDefaults() {
    acsAuthBase.value = envAcsAuth
    acsAuthWebBase.value = envAcsAuthWeb
  }

  return {
    acsAuthBase,
    acsAuthWebBase,
    acsAuthBaseTrimmed,
    acsAuthWebBaseTrimmed,
    resolveAcsAuthPath,
    resolveAcsAuthWebPath,
    loadDefaults
  }
})
