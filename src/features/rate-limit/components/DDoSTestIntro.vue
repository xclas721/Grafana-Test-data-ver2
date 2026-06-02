<script setup lang="ts">
import { ref, computed } from 'vue'
import { PREREQUISITES, OPERATION_STEPS, TEST_DESCRIPTIONS } from '../constants'

type TestType = keyof typeof TEST_DESCRIPTIONS

const props = defineProps<{
  testType: TestType
}>()

const collapsed = ref(false)
const desc = computed(() => TEST_DESCRIPTIONS[props.testType])

const hasConfig = computed(() => 'config' in desc.value)
const hasCheckOrder = computed(() => 'checkOrder' in desc.value)
const hasFocus = computed(() => 'focus' in desc.value)

const descConfig = computed(() =>
  'config' in desc.value ? (desc.value as { config: string }).config : ''
)
const descCheckOrder = computed(() =>
  'checkOrder' in desc.value ? (desc.value as { checkOrder: string }).checkOrder : ''
)
const descFocus = computed(() =>
  'focus' in desc.value ? (desc.value as { focus: string }).focus : ''
)
</script>

<template>
  <div class="rounded-lg border border-base-300 bg-base-100/80 overflow-hidden">
    <button
      type="button"
      class="w-full flex items-center justify-between gap-4 px-4 py-3 text-left hover:bg-base-200/50 transition-colors"
      @click="collapsed = !collapsed"
    >
      <div class="flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-5 w-5 text-info shrink-0 transition-transform"
          :class="{ 'rotate-90': !collapsed }"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
        <span class="font-semibold text-base-content">{{ desc.title }}：測試說明與原理</span>
      </div>
      <span class="text-xs text-base-content/50">{{ collapsed ? '點擊展開' : '點擊收合' }}</span>
    </button>

    <div v-show="!collapsed" class="border-t border-base-300">
      <!-- 前置條件 -->
      <div class="px-4 py-3 bg-warning/5 border-b border-base-300">
        <div class="text-sm font-medium text-base-content/90 mb-2">{{ PREREQUISITES.title }}</div>
        <ul class="text-sm text-base-content/70 space-y-1 list-disc list-inside">
          <li v-for="(item, i) in PREREQUISITES.items" :key="i">{{ item }}</li>
        </ul>
      </div>

      <!-- 測試說明 -->
      <div class="px-4 py-4 space-y-3 text-sm">
        <div>
          <span class="font-medium text-base-content/90">用途：</span>
          <span class="text-base-content/80">{{ desc.purpose }}</span>
        </div>
        <div>
          <span class="font-medium text-base-content/90">原理：</span>
          <span class="text-base-content/80">{{ desc.principle }}</span>
        </div>
        <div v-if="hasConfig">
          <span class="font-medium text-base-content/90">設定：</span>
          <span class="text-error font-mono">{{ descConfig }}</span>
          <span class="text-base-content/60 text-xs block mt-1"
            >請於後端 properties 檔案內修改</span
          >
        </div>
        <div v-if="hasCheckOrder">
          <span class="font-medium text-base-content/90">檢查順序：</span>
          <span class="text-base-content/80">{{ descCheckOrder }}</span>
        </div>
        <div v-if="hasFocus">
          <span class="font-medium text-base-content/90">重點：</span>
          <span class="text-base-content/80">{{ descFocus }}</span>
        </div>
        <div class="pt-2">
          <span class="font-medium text-success">預期結果：</span>
          <span class="text-base-content/80">{{ desc.expected }}</span>
        </div>
        <div class="pt-4 mt-4 border-t border-base-300">
          <div class="text-sm font-medium text-base-content/90 mb-2">操作步驟</div>
          <ol class="text-sm text-base-content/80 space-y-1 list-decimal list-inside">
            <li v-for="(step, i) in OPERATION_STEPS" :key="i">{{ step }}</li>
          </ol>
        </div>
      </div>
    </div>
  </div>
</template>
