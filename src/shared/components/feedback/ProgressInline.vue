<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  value: number
  max?: number
  tone?: 'primary' | 'success' | 'warning' | 'error'
  showPercent?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  max: 100,
  tone: 'primary',
  showPercent: true
})

const progressClass = computed(() => {
  const toneClassMap: Record<NonNullable<Props['tone']>, string> = {
    primary: 'progress-primary',
    success: 'progress-success',
    warning: 'progress-warning',
    error: 'progress-error'
  }
  return `progress ${toneClassMap[props.tone]} w-full`
})

const percent = computed(() => {
  if (!props.max || props.max <= 0) return 0
  return Math.max(0, Math.min(100, Math.round((props.value / props.max) * 100)))
})
</script>

<template>
  <div class="space-y-1">
    <progress :class="progressClass" :value="value" :max="max"></progress>
    <div v-if="showPercent" class="text-xs text-base-content/60 text-right">{{ percent }}%</div>
  </div>
</template>
