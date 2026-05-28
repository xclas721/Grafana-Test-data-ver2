<script setup lang="ts">
import { Card, Input } from '@/shared/components'

const props = defineProps<{
  exchangeRate: string
  exchangeBase: string
  exchangeTarget: string
  currencyCodeForRate: string
}>()

const emit = defineEmits<{
  'update:exchangeRate': [value: string]
  'update:exchangeBase': [value: string]
  'update:exchangeTarget': [value: string]
  'update:currencyCodeForRate': [value: string]
}>()
</script>

<template>
  <!-- 6.匯率信息 -->
  <section id="exchange-rate" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">6.匯率信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          id="exchangeRate"
          type="number"
          label="匯率 (exchangeRate)"
          :model-value="props.exchangeRate"
          :step="'0.0001'"
          @update:model-value="(value) => emit('update:exchangeRate', String(value))"
        />
        <Input
          id="exchangeBase"
          label="基礎貨幣 (exchangeBase)"
          :model-value="props.exchangeBase"
          @update:model-value="(value) => emit('update:exchangeBase', String(value))"
        />
        <Input
          id="exchangeTarget"
          label="目標貨幣 (exchangeTarget)"
          :model-value="props.exchangeTarget"
          @update:model-value="(value) => emit('update:exchangeTarget', String(value))"
        />
        <Input
          id="currencyCodeForRate"
          label="匯率貨幣代碼 (currencyCodeForRate)"
          :model-value="props.currencyCodeForRate"
          @update:model-value="(value) => emit('update:currencyCodeForRate', String(value))"
        />
      </div>
    </Card>
  </section>
</template>
