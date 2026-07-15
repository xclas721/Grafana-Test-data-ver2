<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { Card, Input } from '@/shared/components'

const { t } = useI18n()
import {
  EMV_THREEDS_ERROR_PRESETS,
  type EmvThreeDSErrorPreset
} from '@/shared/constants/emvThreeDSErrorPresets'

const props = defineProps<{
  errorComponent: string
  errorDescription: string
  errorCode: string
  errorDetail: string
  errorMessageType: string
  /** 批量 POST 時依比例隨機混入錯誤 */
  enableBatchErrorMix: boolean
  batchErrorMixPercent: string
  /** 僅用於說明文字：3DSS 模式與後端 3dss-transaction 對齊 */
  activeMode?: 'acs' | 'dss'
}>()

const emit = defineEmits<{
  'update:enableBatchErrorMix': [value: boolean]
  'update:batchErrorMixPercent': [value: string]
  'update:errorComponent': [value: string]
  'update:errorDescription': [value: string]
  'update:errorCode': [value: string]
  'update:errorDetail': [value: string]
  'update:errorMessageType': [value: string]
}>()

function applyPreset(preset: EmvThreeDSErrorPreset) {
  emit('update:errorCode', preset.errorCode)
  emit('update:errorComponent', preset.errorComponent)
  emit('update:errorDescription', preset.errorDescription)
  emit('update:errorDetail', preset.errorDetail)
  emit('update:errorMessageType', preset.errorMessageType)
}

const presets = EMV_THREEDS_ERROR_PRESETS
</script>

<template>
  <!-- 10.錯誤處理 -->
  <section id="error-handling" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-2">
        10. 錯誤處理（對齊 EMV Table A.4 / 3dss-transaction）
      </h3>
      <p class="text-sm text-base-content/70 mb-3 leading-relaxed">
        後端與 Grafana「錯誤代碼摘要」會<strong>排除</strong>
        <code class="text-xs bg-base-200 px-1 rounded">errorCode = NULL_VALUE</code>
        的文件。若要看到統計，請套用下方預設（例如
        <strong>101</strong>、<strong>203</strong>）或手動輸入三位數代碼與
        <code class="text-xs bg-base-200 px-1 rounded">errorComponent</code>（S／A／D／C）。
        <span v-if="props.activeMode === 'dss'" class="block mt-1">
          目前為 <strong>3DSS</strong> 模式：插入索引為
          <code class="text-xs bg-base-200 px-1 rounded">3dss-transaction-*</code>
          ，欄位與正式 transform 彙總後文件一致。
        </span>
      </p>

      <div
        class="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-lg bg-base-200/50 border border-base-300"
      >
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            :checked="props.enableBatchErrorMix"
            @change="
              (e) => emit('update:enableBatchErrorMix', (e.target as HTMLInputElement).checked)
            "
          />
          <span class="text-sm font-medium">{{ t('testData.errorMix.enableLabel') }}</span>
        </label>
        <div class="flex items-center gap-2">
          <label for="batchErrorMixPercent" class="text-sm text-base-content/80">{{
            t('testData.errorMix.percentLabel')
          }}</label>
          <input
            id="batchErrorMixPercent"
            type="number"
            min="0"
            max="100"
            step="1"
            :placeholder="t('testData.errorMix.percentPlaceholder')"
            :title="t('testData.errorMix.percentTitle')"
            class="input input-bordered input-sm w-20"
            :disabled="!props.enableBatchErrorMix"
            :value="props.batchErrorMixPercent"
            @input="
              (e) =>
                emit(
                  'update:batchErrorMixPercent',
                  String(
                    Math.min(100, Math.max(0, Number((e.target as HTMLInputElement).value) || 0))
                  )
                )
            "
          />
        </div>
        <p class="text-xs text-base-content/60 w-full basis-full leading-relaxed">
          {{ t('testData.errorMix.description') }}
        </p>
      </div>

      <div class="flex flex-wrap gap-2 mb-4">
        <button
          v-for="p in presets"
          :key="p.id"
          type="button"
          class="btn btn-sm"
          :class="p.id === 'none' ? 'btn-ghost' : 'btn-outline btn-primary'"
          @click="applyPreset(p)"
        >
          {{ p.shortLabel }}
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          id="errorComponent"
          label="錯誤組件 (errorComponent)"
          :model-value="props.errorComponent"
          @update:model-value="(value) => emit('update:errorComponent', String(value))"
        />
        <Input
          id="errorDescription"
          label="錯誤描述 (errorDescription)"
          :model-value="props.errorDescription"
          @update:model-value="(value) => emit('update:errorDescription', String(value))"
        />
        <Input
          id="errorCode"
          label="錯誤代碼 (errorCode)"
          :model-value="props.errorCode"
          @update:model-value="(value) => emit('update:errorCode', String(value))"
        />
        <Input
          id="errorDetail"
          label="錯誤詳情 (errorDetail)"
          :model-value="props.errorDetail"
          @update:model-value="(value) => emit('update:errorDetail', String(value))"
        />
        <Input
          id="errorMessageType"
          label="錯誤訊息類型 (errorMessageType)"
          :model-value="props.errorMessageType"
          @update:model-value="(value) => emit('update:errorMessageType', String(value))"
        />
      </div>
    </Card>
  </section>
</template>
