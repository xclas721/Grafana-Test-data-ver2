<script setup lang="ts">
import { computed } from 'vue'
import { ProgressInline } from '@/shared/components'

export type BulkLogType = 'success' | 'error' | 'info' | 'warning'

export type BulkLogEntry = {
  type: BulkLogType
  message: string
  at: string
}

const props = withDefaults(
  defineProps<{
    visible: boolean
    statusText: string
    current: number
    total: number
    success: number
    error: number
    elapsedSec: number
    logs: BulkLogEntry[]
    errors: string[]
  }>(),
  {
    visible: false,
    statusText: '',
    current: 0,
    total: 0,
    success: 0,
    error: 0,
    elapsedSec: 0,
    logs: () => [],
    errors: () => []
  }
)

const emit = defineEmits<{
  close: []
}>()

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const progressTone = computed(() => {
  if (props.error > 0 && props.success === 0) return 'error' as const
  if (props.error > 0) return 'warning' as const
  return 'success' as const
})

function logClass(type: BulkLogType) {
  if (type === 'success') return 'text-success'
  if (type === 'error') return 'text-error'
  if (type === 'warning') return 'text-warning'
  return 'text-info'
}
</script>

<template>
  <div
    v-if="visible"
    class="fixed bottom-4 right-4 z-40 w-[min(420px,calc(100vw-2rem))] rounded-lg border border-base-300 bg-base-100 shadow-xl"
  >
    <div class="flex items-center justify-between gap-2 border-b border-base-300 px-4 py-3">
      <div>
        <div class="font-semibold text-sm">批量 POST 進度</div>
        <div class="text-xs text-base-content/60">{{ statusText }}</div>
      </div>
      <button type="button" class="btn btn-ghost btn-xs" @click="emit('close')">關閉</button>
    </div>
    <div class="p-4 space-y-3">
      <ProgressInline :value="current" :max="total || 1" :tone="progressTone" />
      <div class="grid grid-cols-2 gap-2 text-xs text-base-content/80">
        <div>進度：{{ current }} / {{ total }}（{{ percent }}%）</div>
        <div>耗時：{{ elapsedSec }}s</div>
        <div class="text-success">成功：{{ success }}</div>
        <div class="text-error">失敗：{{ error }}</div>
      </div>
      <div
        v-if="errors.length"
        class="max-h-24 overflow-y-auto rounded border border-error/30 bg-error/5 p-2 space-y-1"
      >
        <div v-for="(err, idx) in errors" :key="idx" class="text-xs text-error">{{ err }}</div>
      </div>
      <div class="max-h-40 overflow-y-auto rounded bg-base-200/80 p-2 space-y-1">
        <div v-for="(log, idx) in logs" :key="idx" class="text-xs" :class="logClass(log.type)">
          [{{ log.at }}] {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>
