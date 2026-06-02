/**
 * API 網域／基礎 URL 共用設定
 *
 * 留空時：使用相對路徑 (/acs-auth、/acs-auth-web)，需由 proxy 轉發
 * - 開發：Vite dev server proxy (vite.config.ts)
 * - 部署：nginx 等反向代理，或 .env 建置時預設
 *
 * 部署預設值：設定 VITE_ACS_AUTH_BASE、VITE_ACS_AUTH_WEB_BASE
 */
import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

const STORAGE_KEY = 'insightedge-es-api-config'
const envAcsAuth = import.meta.env.VITE_ACS_AUTH_BASE ?? ''
const envAcsAuthWeb = import.meta.env.VITE_ACS_AUTH_WEB_BASE ?? ''

interface StoredApiConfig {
  acsAuthBase: string
  acsAuthWebBase: string
}

function readStored(): StoredApiConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredApiConfig
    if (typeof parsed.acsAuthBase !== 'string' || typeof parsed.acsAuthWebBase !== 'string') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function writeStored(config: StoredApiConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
  } catch {
    /* 私人模式等情境略過 */
  }
}

const stored = readStored()

export const useApiConfigStore = defineStore('apiConfig', () => {
  const acsAuthBase = ref(stored?.acsAuthBase ?? envAcsAuth)
  const acsAuthWebBase = ref(stored?.acsAuthWebBase ?? envAcsAuthWeb)

  const acsAuthBaseTrimmed = computed(() => acsAuthBase.value.trim())
  const acsAuthWebBaseTrimmed = computed(() => acsAuthWebBase.value.trim())

  function resolveAcsAuthPath(path: string): string {
    const base = acsAuthBaseTrimmed.value
    const p = path.startsWith('/') ? path : `/${path}`
    return base ? `${base.replace(/\/+$/, '')}${p}` : p
  }

  function resolveAcsAuthWebPath(path: string): string {
    const base = acsAuthWebBaseTrimmed.value
    const p = path.startsWith('/') ? path : `/${path}`
    return base ? `${base.replace(/\/+$/, '')}${p}` : p
  }

  function loadDefaults() {
    acsAuthBase.value = envAcsAuth
    acsAuthWebBase.value = envAcsAuthWeb
  }

  function persist() {
    writeStored({
      acsAuthBase: acsAuthBase.value,
      acsAuthWebBase: acsAuthWebBase.value
    })
  }

  watch([acsAuthBase, acsAuthWebBase], persist)

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
