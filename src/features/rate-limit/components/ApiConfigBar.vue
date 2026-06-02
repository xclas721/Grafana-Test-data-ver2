<script setup lang="ts">
import { computed } from 'vue'
import { Settings } from 'lucide-vue-next'
import { useApiConfigStore } from '@/stores/apiConfig'
import { Button, Input } from '@/shared/components'

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
  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between w-full px-4 py-3">
    <div class="flex items-center gap-3 min-w-0">
      <span class="text-sm font-semibold shrink-0 text-base-content/80">API 網域</span>
      <span class="text-sm text-base-content/70 truncate" :title="summaryText">{{
        summaryText
      }}</span>
    </div>
    <div class="dropdown dropdown-end shrink-0 self-end sm:self-auto">
      <label tabindex="0" class="btn btn-primary btn-sm gap-1.5">
        <Settings class="h-4 w-4" aria-hidden="true" />
        設定
      </label>
      <div
        tabindex="0"
        class="dropdown-content z-50 w-[min(24rem,92vw)] p-4 bg-base-100 rounded-box shadow-lg border border-base-300 mt-2"
      >
        <div class="space-y-3">
          <p class="text-sm font-semibold text-base-content">
            API 基礎 URL（留空則使用相對路徑，由 proxy 轉發）
          </p>
          <Input
            v-model="store.acsAuthBase"
            label="acs-auth (30100)"
            placeholder="例: http://localhost:30100"
          />
          <Input
            v-model="store.acsAuthWebBase"
            label="acs-auth-web (8050)"
            placeholder="例: http://localhost:8050"
          />
          <Button variant="outline" size="sm" @click="store.loadDefaults">還原預設</Button>
        </div>
      </div>
    </div>
  </div>
</template>
