<script setup lang="ts">
import { computed } from 'vue'
import { useApiConfigStore } from '@/stores/apiConfig'
import { Input } from '@/shared/components'

const store = useApiConfigStore()

const summaryText = computed(() => {
  const a = store.acsAuthBaseTrimmed
  const w = store.acsAuthWebBaseTrimmed
  if (!a && !w) return '使用相對路徑（由 Vite 或 nginx proxy 轉發）'
  const parts: string[] = []
  if (a) parts.push(`acs-auth: ${a}`)
  if (w) parts.push(`acs-auth-web: ${w}`)
  return parts.join('  |  ')
})
</script>

<template>
  <div class="flex items-center justify-between gap-4 w-full px-4 py-2">
    <div class="flex items-center gap-3 min-w-0">
      <span class="text-sm font-semibold shrink-0 text-base-content/80">API 網域</span>
      <span class="text-sm text-base-content/70 truncate">{{ summaryText }}</span>
    </div>
    <div class="dropdown dropdown-end shrink-0">
      <label tabindex="0" class="btn btn-primary btn-sm gap-1">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
        設定
      </label>
      <div
        tabindex="0"
        class="dropdown-content z-50 w-96 p-4 bg-base-100 rounded-box shadow-lg border border-base-300 mt-2"
      >
        <div class="space-y-3">
          <div class="text-sm font-semibold">API 基礎 URL（留空使用相對路徑，由 proxy 轉發）</div>
          <Input
            v-model="store.acsAuthBase"
            label="acs-auth (30100)"
            placeholder="例: http://localhost:30100"
            class="text-sm"
          />
          <Input
            v-model="store.acsAuthWebBase"
            label="acs-auth-web (8050)"
            placeholder="例: http://localhost:8050"
            class="text-sm"
          />
          <button class="btn btn-ghost btn-sm" @click="store.loadDefaults">還原預設</button>
        </div>
      </div>
    </div>
  </div>
</template>
