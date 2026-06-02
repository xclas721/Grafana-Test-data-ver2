<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ProgressInline } from '@/shared/components'
import {
  estimateEtaSeconds,
  formatCount,
  formatCustomTimeRangeLabel,
  recordsPerSecond,
  type BatchProgressSummary
} from '@/features/test-data/batchInsertProgress'

export type BulkLogType = 'success' | 'error' | 'info' | 'warning'

export type BulkLogEntry = {
  type: BulkLogType
  message: string
  at: string
}

const props = withDefaults(
  defineProps<{
    visible?: boolean
    finished?: boolean
    phaseLabel?: string
    summary?: BatchProgressSummary | null
    current?: number
    total?: number
    success?: number
    error?: number
    elapsedSec?: number
    logs?: BulkLogEntry[]
    errors?: string[]
  }>(),
  {
    visible: false,
    finished: false,
    phaseLabel: '',
    summary: null,
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

const { t } = useI18n()
const logsOpen = ref(false)

const percent = computed(() => {
  if (props.total <= 0) return 0
  return Math.round((props.current / props.total) * 100)
})

const progressTone = computed(() => {
  if (props.finished && props.error > 0 && props.success === 0) return 'error' as const
  if (props.error > 0) return 'warning' as const
  if (props.finished) return 'success' as const
  return 'primary' as const
})

const headline = computed(() =>
  props.finished ? t('testData.progress.done') : t('testData.progress.processing')
)

const countLabel = computed(() =>
  t('testData.progress.count', {
    current: formatCount(props.current),
    total: formatCount(props.total)
  })
)

const rateLabel = computed(() => {
  const rate = recordsPerSecond(props.current, props.elapsedSec)
  if (rate == null) return null
  return t('testData.progress.rate', { rate })
})

const etaLabel = computed(() => {
  const sec = estimateEtaSeconds(props.current, props.total, props.elapsedSec)
  if (sec == null) return null
  return t('testData.progress.eta', { seconds: sec })
})

const scopeLine = computed(() => {
  const s = props.summary
  if (!s) return ''
  if (s.scopeType === 'custom') {
    return t('testData.progress.scope.custom', {
      range: formatCustomTimeRangeLabel(s.startDateTime, s.endDateTime)
    })
  }
  if (s.scopeType === 'now') return t('testData.progress.scope.now')
  return t('testData.progress.scope.days', { days: s.scopeDays })
})

const summaryChips = computed(() => {
  const s = props.summary
  if (!s) return [] as string[]
  const chips = [
    t('testData.progress.summary.total', { count: formatCount(s.total) }),
    t('testData.progress.summary.mode', { mode: s.mode.toUpperCase() }),
    scopeLine.value,
    t('testData.progress.summary.bulk', { chunk: s.chunkSize, concurrency: s.concurrency })
  ]
  if (s.errorMixPercent != null) {
    chips.splice(3, 0, t('testData.progress.summary.errorMix', { percent: s.errorMixPercent }))
  }
  return chips
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
    class="bulk-progress-panel fixed bottom-4 right-4 z-40 w-[min(440px,calc(100vw-2rem))] rounded-lg border border-base-300 bg-base-100 shadow-xl"
  >
    <div class="flex items-start justify-between gap-3 border-b border-base-300 px-4 py-3">
      <div class="min-w-0 flex-1">
        <div class="flex items-baseline justify-between gap-2">
          <div class="font-semibold text-sm">{{ t('testData.progress.title') }}</div>
          <div class="text-lg font-bold tabular-nums text-primary">{{ percent }}%</div>
        </div>
        <div class="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
          <span class="font-medium" :class="finished ? 'text-success' : 'text-base-content'">
            {{ headline }}
          </span>
          <span class="text-base-content/50">·</span>
          <span class="tabular-nums text-base-content/80">{{ countLabel }}</span>
        </div>
        <p v-if="phaseLabel" class="text-xs text-base-content/60 mt-1 truncate" :title="phaseLabel">
          {{ phaseLabel }}
        </p>
      </div>
      <button type="button" class="btn btn-ghost btn-xs shrink-0" @click="emit('close')">
        {{ t('testData.progress.close') }}
      </button>
    </div>

    <div class="p-4 space-y-3">
      <ProgressInline
        :value="current"
        :max="total || 1"
        :tone="progressTone"
        :show-percent="false"
      />

      <div class="flex flex-wrap gap-2 text-xs text-base-content/75">
        <span>{{ t('testData.progress.elapsed', { seconds: elapsedSec }) }}</span>
        <template v-if="rateLabel">
          <span class="opacity-40">·</span>
          <span class="tabular-nums">{{ rateLabel }}</span>
        </template>
        <template v-if="etaLabel && !finished">
          <span class="opacity-40">·</span>
          <span class="tabular-nums">{{ etaLabel }}</span>
        </template>
        <span class="opacity-40">·</span>
        <span class="text-success tabular-nums">{{
          t('testData.progress.success', { count: formatCount(success) })
        }}</span>
        <span class="opacity-40">·</span>
        <span class="text-error tabular-nums">{{
          t('testData.progress.failed', { count: formatCount(error) })
        }}</span>
      </div>

      <div v-if="summaryChips.length" class="flex flex-wrap gap-1.5">
        <span
          v-for="(chip, idx) in summaryChips"
          :key="idx"
          class="badge badge-sm badge-ghost font-normal max-w-full truncate"
          :title="chip"
        >
          {{ chip }}
        </span>
      </div>

      <div
        v-if="errors.length"
        class="max-h-28 overflow-y-auto rounded border border-error/30 bg-error/5 p-2 space-y-1"
      >
        <div v-for="(err, idx) in errors.slice(0, 8)" :key="idx" class="text-xs text-error">
          {{ err }}
        </div>
        <p v-if="errors.length > 8" class="text-xs text-error/80">
          {{ t('testData.progress.errorsMore', { count: errors.length - 8 }) }}
        </p>
      </div>

      <details
        class="bulk-progress-log"
        :open="logsOpen"
        @toggle="logsOpen = ($event.target as HTMLDetailsElement).open"
      >
        <summary class="text-xs font-medium text-base-content/60 cursor-pointer select-none">
          {{ t('testData.progress.log.toggle', { count: logs.length }) }}
        </summary>
        <div
          v-if="logs.length"
          class="mt-2 max-h-36 overflow-y-auto rounded bg-base-200/80 p-2 space-y-1"
        >
          <div v-for="(log, idx) in logs" :key="idx" class="text-xs" :class="logClass(log.type)">
            <span class="text-base-content/45 tabular-nums">{{ log.at }}</span>
            {{ log.message }}
          </div>
        </div>
        <p v-else class="mt-2 text-xs text-base-content/45">
          {{ t('testData.progress.log.empty') }}
        </p>
      </details>
    </div>
  </div>
</template>
