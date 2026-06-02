<script setup lang="ts">
import { Modal } from '@/shared/components'
import { CURRENCY_PICKER_OPTIONS } from '@/features/test-data/testDataMaps'
import type { CurrencySelectPayload } from '@/features/test-data/currencySelection'

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  select: [payload: CurrencySelectPayload]
}>()

function close() {
  emit('update:modelValue', false)
}

function onPick(option: (typeof CURRENCY_PICKER_OPTIONS)[number]) {
  emit('select', {
    numeric: option.numeric,
    code: option.code,
    name: option.name,
    country: option.country
  })
  close()
}
</script>

<template>
  <Modal
    :model-value="props.modelValue"
    title="選擇貨幣"
    size="3xl"
    @update:model-value="emit('update:modelValue', $event)"
    @close="close"
  >
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
      <button
        v-for="item in CURRENCY_PICKER_OPTIONS"
        :key="item.numeric"
        type="button"
        class="border border-base-300 rounded-lg p-3 text-left hover:bg-base-200 transition-colors"
        @click="onPick(item)"
      >
        <div class="font-semibold">{{ item.country }}</div>
        <div class="text-sm text-base-content/70">{{ item.name }} ({{ item.code }})</div>
        <div class="text-xs text-base-content/50">代碼: {{ item.numeric }}</div>
      </button>
    </div>
  </Modal>
</template>
