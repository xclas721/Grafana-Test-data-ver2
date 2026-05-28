<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, PageHeader, Input } from '@/shared/components'
import {
  dateFormat,
  valOrNA,
  getOptionsByValue,
  isDifferent,
  useTimeCalculations
} from '@/shared/utils/format'
import type { BaseSelect, BaseI18nSelect } from '@/shared/utils/select/baseSelect'
import { useAppStore } from '@/stores/app'

const { t } = useI18n()

// ===== 日期格式化 =====
const dateInput = ref(new Date().toISOString().slice(0, 16))
const dateFormatOption = ref('yyyy-MM-dd HH:mm:ss')
const dateFormatOptions = [
  { value: 'yyyy-MM-dd HH:mm:ss', label: '標準格式' },
  { value: 'yyyy-MM-dd', label: '日期' },
  { value: 'HH:mm:ss', label: '時間' },
  { value: 'yyyy年MM月dd日 HH:mm', label: '中文格式' }
]
const formattedDate = computed(() => {
  if (!dateInput.value) return 'N/A'
  return dateFormat(new Date(dateInput.value), dateFormatOption.value) ?? 'N/A'
})

// ===== 空值處理 =====
const valInput = ref('')
const nullDefaultValue = ref('N/A')
const formattedVal = computed(() => valOrNA(valInput.value, nullDefaultValue.value))

// ===== 選項查找 =====
const optionsDemo: (BaseSelect | BaseI18nSelect)[] = [
  { value: '1', text: '選項一' },
  { value: '2', i18nText: 'ui.success' },
  { value: '3', text: '選項三' }
]
const optionValue = ref('')
const optionResult = computed(() => getOptionsByValue(optionValue.value, optionsDemo))

// ===== 值比較 =====
const diffValue1 = ref('')
const diffValue2 = ref('')
const diffResult = computed(() => isDifferent(diffValue1.value, diffValue2.value))
const diffExamples = [
  { label: '字串比較（忽略空白）', val1: '  hello  ', val2: 'hello' },
  { label: '空字串比較', val1: '', val2: '' },
  { label: '空值比較', val1: '', val2: null },
  { label: '數字比較', val1: '123', val2: '456' }
]

// ===== 時間計算 =====
const appStore = useAppStore()
const { getStartDate, getEndDate } = useTimeCalculations()

// 時間計算控制
const timeOffset = computed({
  get: () => appStore.startDate,
  set: (val) => {
    appStore.startDate = val
  }
})
const timeUnit = computed({
  get: () => appStore.dateUnit,
  set: (val) => {
    appStore.dateUnit = val
  }
})
const timeUnitOptions = computed(() => [
  { value: 'hour', label: t('format.timecalc.unit.hour') },
  { value: 'day', label: t('format.timecalc.unit.day') },
  { value: 'month', label: t('format.timecalc.unit.month') }
])
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.format')" :subtitle="t('format.subtitle')" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 日期格式化 -->
      <Card :title="t('format.date.title')" :subtitle="t('format.date.desc')">
        <div class="flex flex-col gap-4">
          <Input type="datetime-local" v-model="dateInput" :label="t('format.date.label')" />
          <div>
            <label class="label">
              <span class="label-text">{{ t('format.date.format') }}</span>
            </label>
            <select v-model="dateFormatOption" class="select select-bordered w-full">
              <option v-for="opt in dateFormatOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }} ({{ opt.value }})
              </option>
            </select>
          </div>
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">{{ t('format.date.result') }}</div>
            <div class="font-mono text-sm">{{ formattedDate }}</div>
          </div>
        </div>
      </Card>

      <!-- 空值處理 -->
      <Card :title="t('format.null.title')" :subtitle="t('format.null.desc')">
        <div class="flex flex-col gap-4">
          <Input
            v-model="valInput"
            :label="t('format.null.label')"
            :placeholder="t('format.null.placeholder')"
          />
          <div>
            <label class="label">
              <span class="label-text">{{ t('format.null.defaultValue') }}</span>
            </label>
            <Input v-model="nullDefaultValue" :placeholder="'N/A'" />
          </div>
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">{{ t('format.null.result') }}</div>
            <div class="font-mono text-sm">{{ formattedVal }}</div>
          </div>
          <div class="text-xs text-base-content/60">
            {{ t('format.null.hint') }}
          </div>
        </div>
      </Card>

      <!-- 選項查找 -->
      <Card :title="t('format.options.title')" :subtitle="t('format.options.desc')">
        <div class="flex flex-col gap-4">
          <Input
            v-model="optionValue"
            :label="t('format.options.value')"
            :placeholder="t('format.options.placeholder')"
          />
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">
              {{ t('format.options.result') }}
            </div>
            <div class="font-mono">{{ optionResult || 'N/A' }}</div>
          </div>
        </div>
      </Card>

      <!-- 值比較 -->
      <Card :title="t('format.different.title')" :subtitle="t('format.different.desc')">
        <div class="flex flex-col gap-4">
          <Input v-model="diffValue1" :label="t('format.different.value1')" />
          <Input v-model="diffValue2" :label="t('format.different.value2')" />
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">
              {{ t('format.different.result') }}
            </div>
            <div class="font-mono">
              <span :class="diffResult ? 'text-error' : 'text-success'" class="font-semibold">
                {{ diffResult ? t('format.different.different') : t('format.different.same') }}
              </span>
            </div>
          </div>
          <div class="divider text-xs">{{ t('format.different.examples') }}</div>
          <div class="space-y-2">
            <div
              v-for="(example, idx) in diffExamples"
              :key="idx"
              class="text-xs bg-base-200 p-2 rounded"
            >
              <div class="text-base-content/70 mb-1">{{ example.label }}</div>
              <div class="font-mono text-xs">
                {{ t('format.different.value1') }}: "{{ example.val1 }}",
                {{ t('format.different.value2') }}: "{{ example.val2 }}" →
                <span
                  :class="isDifferent(example.val1, example.val2) ? 'text-error' : 'text-success'"
                >
                  {{
                    isDifferent(example.val1, example.val2)
                      ? t('format.different.different')
                      : t('format.different.same')
                  }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- 時間計算 -->
      <Card
        :title="t('format.timecalc.title')"
        :subtitle="t('format.timecalc.desc')"
        class="md:col-span-2"
      >
        <div class="flex flex-col gap-4">
          <!-- 控制項 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="label">
                <span class="label-text">{{ t('format.timecalc.offset') }}</span>
              </label>
              <input
                v-model.number="timeOffset"
                type="number"
                min="1"
                class="input input-bordered w-full"
                :placeholder="t('format.timecalc.offset.placeholder')"
              />
            </div>
            <div>
              <label class="label">
                <span class="label-text">{{ t('format.timecalc.unit') }}</span>
              </label>
              <select v-model="timeUnit" class="select select-bordered w-full">
                <option v-for="opt in timeUnitOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>
          </div>

          <!-- 結果顯示 -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="bg-base-200 p-3 rounded-lg">
              <div class="text-sm text-base-content/70 mb-1">
                {{ t('format.timecalc.start') }}
              </div>
              <div class="font-mono text-sm">{{ getStartDate }}</div>
            </div>
            <div class="bg-base-200 p-3 rounded-lg">
              <div class="text-sm text-base-content/70 mb-1">
                {{ t('format.timecalc.end') }}
              </div>
              <div class="font-mono text-sm">{{ getEndDate }}</div>
            </div>
          </div>

          <!-- 說明 -->
          <div class="text-xs text-base-content/60">
            {{ t('format.timecalc.hint') }}
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
