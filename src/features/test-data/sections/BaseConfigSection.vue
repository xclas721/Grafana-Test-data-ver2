<script setup lang="ts">
import { computed } from 'vue'
import { Card, Input, Select, type SelectOption } from '@/shared/components'
import { getTestDataTimezoneOptions } from '@/shared/utils/appProperties'

const props = defineProps<{
  baseUrl: string
  username: string
  password: string
  currentDate: string
  enableCustomTimeRange: boolean
  enableAutoTimeRange: boolean
  startDateTime: string
  endDateTime: string
  timezone: string
  modeText: string
  modeClass: string
  timeRangeHtml: string
}>()

const emit = defineEmits<{
  'update:baseUrl': [value: string]
  'update:username': [value: string]
  'update:password': [value: string]
  'update:currentDate': [value: string]
  'update:enableCustomTimeRange': [value: boolean]
  'update:enableAutoTimeRange': [value: boolean]
  'update:startDateTime': [value: string]
  'update:endDateTime': [value: string]
  'update:timezone': [value: string]
}>()

const timezoneOptions = computed<SelectOption[]>(() =>
  getTestDataTimezoneOptions().map((item) => ({
    value: item.value,
    label: item.label
  }))
)

const timeRangeText = computed(() => {
  const raw = String(props.timeRangeHtml || '請選擇日期')
  return raw
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/div>\s*<div>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .trim()
})
</script>

<template>
  <!-- 基礎配置 -->
  <section id="base-config" class="scroll-mt-24">
    <Card>
      <div class="flex items-center gap-2 mb-4">
        <h3 class="text-base font-semibold text-base-content/80">基礎配置</h3>
        <span :class="props.modeClass">{{ props.modeText }}</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            id="baseUrl"
            type="url"
            label="Elasticsearch URL (base_url)"
            :model-value="props.baseUrl"
            required
            @update:model-value="(value) => emit('update:baseUrl', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">Elasticsearch 服務地址</p>
        </div>
        <Input
          id="username"
          label="用戶名 (username)"
          :model-value="props.username"
          required
          @update:model-value="(value) => emit('update:username', String(value))"
        />
        <Input
          id="password"
          type="password"
          label="密碼 (password)"
          :model-value="props.password"
          required
          @update:model-value="(value) => emit('update:password', String(value))"
        />
        <div>
          <Input
            id="startDateTime"
            type="datetime-local"
            label="起始時間 (startDateTime)"
            :model-value="props.startDateTime"
            :disabled="props.enableAutoTimeRange"
            @update:model-value="(value) => emit('update:startDateTime', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">
            {{ props.enableAutoTimeRange ? '依天數自動往前推' : '可手動調整' }}
          </p>
        </div>
        <div>
          <Input
            id="endDateTime"
            type="datetime-local"
            label="結束時間 (endDateTime)"
            :model-value="props.endDateTime"
            :disabled="props.enableAutoTimeRange"
            @update:model-value="(value) => emit('update:endDateTime', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">
            {{ props.enableAutoTimeRange ? '自動帶入現在時間' : '可手動調整' }}
          </p>
        </div>
        <div>
          <div class="flex items-center gap-2 mt-1">
            <input
              id="enableAutoTimeRange"
              type="checkbox"
              class="checkbox checkbox-sm"
              :checked="props.enableAutoTimeRange"
              @change="
                (event) =>
                  emit('update:enableAutoTimeRange', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableAutoTimeRange" class="text-sm text-base-content/60">
              自動帶入起訖時間
            </label>
          </div>
          <p class="text-xs text-base-content/60 mt-2">取消勾選可自行輸入起訖時間</p>
        </div>
        <div>
          <Select
            id="timezone"
            label="時區 (timezone)"
            :model-value="props.timezone"
            :options="timezoneOptions"
            required
            @update:model-value="(value) => emit('update:timezone', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">選擇時區用於時間轉換，預設使用瀏覽器時區</p>
        </div>
        <div>
          <label class="label">
            <span class="label-text">UTC時間區間 (Time Range)</span>
          </label>
          <div
            id="timeRangeDisplay"
            class="rounded-md bg-base-200 px-3 py-2 text-base-content/60 whitespace-pre-line"
          >
            {{ timeRangeText }}
          </div>
        </div>
      </div>
    </Card>
  </section>
</template>
