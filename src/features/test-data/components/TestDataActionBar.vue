<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Input, Select, type SelectOption } from '@/shared/components'

const props = defineProps<{
  modeOptions: SelectOption[]
  formMode: string
  currentDate: string
  batchSize: string
  batchDays: string
  enableAutoTimeRange: boolean
  scheduleEnabled: boolean
  scheduleIntervalSeconds: number
  scheduleRunning: boolean
  nextRunInSeconds: number
  posting: boolean
  isWeightValid: boolean
}>()

const emit = defineEmits<{
  'update:formMode': [value: string]
  'update:currentDate': [value: string]
  'update:batchSize': [value: string]
  'update:batchDays': [value: string]
  'update:writeMode': [mode: 'manual' | 'scheduled']
  'update:scheduleIntervalSeconds': [seconds: number]
  loadDefaults: []
  randomizeFields: []
  previewSingle: []
  previewBatch: []
  postSingle: []
  postBatch: []
  startSchedule: []
  stopSchedule: []
}>()

const { t } = useI18n()

const writeMode = computed({
  get: () => (props.scheduleEnabled ? 'scheduled' : 'manual'),
  set: (value: 'manual' | 'scheduled') => emit('update:writeMode', value)
})

const batchDaysTitle = computed(() => {
  if (props.scheduleEnabled) return t('testData.params.batchDays.scheduled')
  if (!props.enableAutoTimeRange) return t('testData.params.batchDays.manualRange')
  return t('testData.params.batchDays.manualAuto')
})

const batchCountForTip = computed(() => Math.max(1, Number.parseInt(props.batchSize, 10) || 1))
</script>

<template>
  <div class="app-sticky-toolbar sticky top-16 z-10 mb-6 rounded-lg border backdrop-blur">
    <div class="px-4 py-3 border-b border-base-300/80">
      <div class="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between xl:gap-6">
        <div class="min-w-0 flex-1">
          <div class="text-xs font-medium text-base-content/50 mb-2">
            {{ t('testData.params.title') }}
          </div>
          <div class="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-4 sm:gap-x-3 lg:max-w-3xl">
            <Select
              :model-value="formMode"
              :label="t('testData.params.productMode')"
              :options="modeOptions"
              class="col-span-2 sm:col-span-1"
              @update:model-value="emit('update:formMode', String($event))"
            />
            <Input
              :model-value="currentDate"
              type="date"
              :label="t('testData.params.baseDate')"
              @update:model-value="emit('update:currentDate', String($event))"
            />
            <Input
              :model-value="batchSize"
              type="number"
              :label="t('testData.params.batchSize')"
              @update:model-value="emit('update:batchSize', String($event))"
            />
            <Input
              :model-value="batchDays"
              type="number"
              :label="t('testData.params.batchDays')"
              :disabled="!enableAutoTimeRange || scheduleEnabled"
              :title="batchDaysTitle"
              @update:model-value="emit('update:batchDays', String($event))"
            />
          </div>
          <p class="test-data-params-footnote">
            <span>{{ t('testData.params.batchSize.hint') }}</span>
            <span class="test-data-params-footnote__sep" aria-hidden="true">·</span>
            <span v-if="scheduleEnabled">{{ t('testData.params.batchDays.scheduled') }}</span>
            <span v-else-if="enableAutoTimeRange">{{ t('testData.params.batchDays.hint') }}</span>
            <span v-else>{{ t('testData.params.batchDays.manualRange') }}</span>
          </p>
        </div>

        <div class="shrink-0 xl:max-w-md">
          <div class="text-xs font-medium text-base-content/50 mb-2">
            {{ t('testData.writeMode.title') }}
          </div>
          <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <label
              class="test-data-write-mode-option"
              :class="{ 'test-data-write-mode-option--active': writeMode === 'manual' }"
            >
              <input
                v-model="writeMode"
                type="radio"
                class="radio radio-sm radio-primary"
                value="manual"
              />
              <span>
                <span class="font-medium text-sm">{{ t('testData.writeMode.manual.label') }}</span>
                <span class="block text-xs text-base-content/60 mt-0.5">{{
                  t('testData.writeMode.manual.hint')
                }}</span>
              </span>
            </label>
            <label
              class="test-data-write-mode-option"
              :class="{ 'test-data-write-mode-option--active': writeMode === 'scheduled' }"
            >
              <input
                v-model="writeMode"
                type="radio"
                class="radio radio-sm radio-primary"
                value="scheduled"
              />
              <span>
                <span class="font-medium text-sm">{{
                  t('testData.writeMode.scheduled.label')
                }}</span>
                <span class="block text-xs text-base-content/60 mt-0.5">{{
                  t('testData.writeMode.scheduled.hint')
                }}</span>
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>

    <details class="test-data-tips-details">
      <summary>{{ t('testData.tips.toggle') }}</summary>
      <p class="test-data-tips-flow">{{ t('testData.tips.flow') }}</p>
      <div class="test-data-tips-grid">
        <div class="test-data-tip-card">
          <div class="test-data-tip-card__title">{{ t('testData.tips.single.title') }}</div>
          {{ t('testData.tips.single.body') }}
        </div>
        <div class="test-data-tip-card">
          <div class="test-data-tip-card__title">{{ t('testData.tips.batch.title') }}</div>
          {{ t('testData.tips.batch.body') }}
        </div>
        <div v-if="writeMode === 'scheduled'" class="test-data-tip-card sm:col-span-2">
          <div class="test-data-tip-card__title">{{ t('testData.tips.scheduled.title') }}</div>
          {{ t('testData.tips.scheduled.body') }}
        </div>
      </div>
    </details>

    <!-- 手動寫入 -->
    <div v-if="writeMode === 'manual'" class="px-4 py-3 space-y-3">
      <section class="test-data-action-group">
        <h4 class="test-data-action-group__title">{{ t('testData.actions.prepare.title') }}</h4>
        <p class="test-data-action-group__hint">{{ t('testData.actions.prepare.hint') }}</p>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" @click="emit('loadDefaults')">
            {{ t('testData.actions.prepare.loadDefaults') }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!isWeightValid"
            @click="emit('randomizeFields')"
          >
            {{ t('testData.actions.prepare.randomize') }}
          </Button>
        </div>
      </section>

      <section class="test-data-action-group">
        <h4 class="test-data-action-group__title">{{ t('testData.actions.preview.title') }}</h4>
        <p class="test-data-action-group__hint">{{ t('testData.actions.preview.hint') }}</p>
        <div class="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" @click="emit('previewSingle')">
            {{ t('testData.actions.preview.single') }}
          </Button>
          <Button variant="ghost" size="sm" @click="emit('previewBatch')">
            {{ t('testData.actions.preview.batch') }}
          </Button>
        </div>
      </section>

      <section class="test-data-action-group test-data-action-group--emphasis">
        <h4 class="test-data-action-group__title">{{ t('testData.actions.post.title') }}</h4>
        <p class="test-data-action-group__hint">{{ t('testData.actions.post.hint') }}</p>
        <div class="test-data-post-actions">
          <div class="test-data-post-action">
            <Button
              variant="primary"
              size="sm"
              :disabled="posting"
              :title="t('testData.tips.single.body')"
              @click="emit('postSingle')"
            >
              {{ t('testData.actions.post.single') }}
            </Button>
            <span class="test-data-post-action__badge">{{
              t('testData.actions.post.single.tip')
            }}</span>
          </div>
          <div class="test-data-post-action">
            <Button
              variant="primary"
              size="sm"
              :disabled="posting || !isWeightValid"
              :title="t('testData.tips.batch.body')"
              @click="emit('postBatch')"
            >
              {{ t('testData.actions.post.batch') }}
            </Button>
            <span class="test-data-post-action__badge">{{
              t('testData.actions.post.batch.tip', { count: batchCountForTip })
            }}</span>
          </div>
        </div>
        <p v-if="!isWeightValid" class="text-xs text-warning mt-2">
          {{ t('testData.actions.weightWarning') }}
        </p>
      </section>
    </div>

    <!-- 定時連續寫入 -->
    <div v-else class="px-4 py-3">
      <section class="test-data-action-group test-data-action-group--emphasis">
        <h4 class="test-data-action-group__title">{{ t('testData.actions.schedule.title') }}</h4>
        <p class="test-data-action-group__hint">{{ t('testData.actions.schedule.hint') }}</p>
        <div class="flex flex-wrap items-end gap-x-3 gap-y-2">
          <Input
            :model-value="String(scheduleIntervalSeconds)"
            type="number"
            :label="t('testData.actions.schedule.interval')"
            class="w-[5.5rem]"
            @update:model-value="
              emit(
                'update:scheduleIntervalSeconds',
                Math.max(1, Number.parseInt(String($event), 10) || 1)
              )
            "
          />
          <Button
            v-if="!scheduleRunning"
            variant="primary"
            size="sm"
            class="h-10"
            :disabled="posting"
            @click="emit('startSchedule')"
          >
            {{ t('testData.actions.schedule.start') }}
          </Button>
          <Button v-else variant="outline" size="sm" class="h-10" @click="emit('stopSchedule')">
            {{ t('testData.actions.schedule.stop') }}
          </Button>
          <span
            v-if="scheduleRunning"
            class="pb-2 text-xs tabular-nums text-base-content/70 whitespace-nowrap"
          >
            {{ t('testData.actions.schedule.nextIn', { seconds: nextRunInSeconds }) }}
          </span>
        </div>
        <p class="text-xs text-base-content/55 mt-3">
          {{ t('testData.actions.schedule.note', { size: batchSize }) }}
        </p>
        <div class="test-data-tip-card mt-3">
          <div class="test-data-tip-card__title">{{ t('testData.tips.scheduled.title') }}</div>
          {{ t('testData.tips.scheduled.body') }}
        </div>
      </section>

      <section class="test-data-action-group mt-3 opacity-90">
        <h4 class="test-data-action-group__title">{{ t('testData.actions.prepare.title') }}</h4>
        <div class="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" @click="emit('loadDefaults')">
            {{ t('testData.actions.prepare.loadDefaults') }}
          </Button>
          <Button
            variant="outline"
            size="sm"
            :disabled="!isWeightValid"
            @click="emit('randomizeFields')"
          >
            {{ t('testData.actions.prepare.randomize') }}
          </Button>
          <Button variant="ghost" size="sm" @click="emit('previewBatch')">
            {{ t('testData.actions.preview.batch') }}
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>
