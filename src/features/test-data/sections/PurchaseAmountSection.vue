<script setup lang="ts">
import { Card, Input, Select, type SelectOption } from '@/shared/components'

const props = defineProps<{
  purchaseAmount: string
  purchaseCurrency: string
  purchaseExponent: string
  usdAmount: string
  enablePurchaseAmountRandom: boolean
  enablePurchaseCurrencyRandom: boolean
}>()

const emit = defineEmits<{
  'update:purchaseAmount': [value: string]
  'update:purchaseCurrency': [value: string]
  'update:purchaseExponent': [value: string]
  'update:usdAmount': [value: string]
  'update:enablePurchaseAmountRandom': [value: boolean]
  'update:enablePurchaseCurrencyRandom': [value: boolean]
  openCurrencyPicker: []
}>()

const purchaseCurrencyOptions: SelectOption[] = [
  { value: '156', label: '156 - 中國人民幣 (CNY)' },
  { value: '901', label: '901 - 台灣新台幣 (TWD)' },
  { value: '840', label: '840 - 美國美元 (USD)' },
  { value: '392', label: '392 - 日本日圓 (JPY)' },
  { value: '344', label: '344 - 香港港幣 (HKD)' },
  { value: '410', label: '410 - 韓國韓元 (KRW)' },
  { value: '702', label: '702 - 新加坡新加坡元 (SGD)' },
  { value: '036', label: '036 - 澳洲澳幣（澳元） (AUD)' },
  { value: '124', label: '124 - 加拿大加幣（加元） (CAD)' },
  { value: '978', label: '978 - 歐元區歐元 (EUR)' },
  { value: '826', label: '826 - 英國英鎊 (GBP)' },
  { value: '116', label: '116 - 柬埔寨瑞爾 (KHR)' },
  { value: '764', label: '764 - 泰國泰銖 (THB)' },
  { value: '704', label: '704 - 越南越南盾 (VND)' },
  { value: '458', label: '458 - 馬來西亞馬幣（令吉） (MYR)' },
  { value: '360', label: '360 - 印尼印尼盾（盧比） (IDR)' },
  { value: '608', label: '608 - 菲律賓菲律賓比索 (PHP)' }
]
</script>

<template>
  <!-- 4.交易金額 -->
  <section id="purchase-amount" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">4.交易金額</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            id="purchaseAmount"
            type="number"
            label="購買金額 (purchaseAmount)"
            :model-value="props.purchaseAmount"
            required
            @update:model-value="(value) => emit('update:purchaseAmount', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enablePurchaseAmountRandom"
              class="checkbox checkbox-sm"
              :checked="props.enablePurchaseAmountRandom"
              @change="
                (event) =>
                  emit(
                    'update:enablePurchaseAmountRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enablePurchaseAmountRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (10-1000)，預設開啟</p>
        </div>
        <div>
          <Select
            id="purchaseCurrency"
            label="購買貨幣代碼 (purchaseCurrency)"
            :model-value="props.purchaseCurrency"
            :options="purchaseCurrencyOptions"
            required
            @update:model-value="(value) => emit('update:purchaseCurrency', String(value))"
          />
          <div class="flex flex-wrap items-center gap-2 mt-1">
            <p class="text-xs text-base-content/60">選擇貨幣類型</p>
            <button
              type="button"
              class="btn btn-outline btn-xs"
              @click="emit('openCurrencyPicker')"
            >
              選擇貨幣…
            </button>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enablePurchaseCurrencyRandom"
              class="checkbox checkbox-sm"
              :checked="props.enablePurchaseCurrencyRandom"
              @change="
                (event) =>
                  emit(
                    'update:enablePurchaseCurrencyRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enablePurchaseCurrencyRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
        </div>
        <Input
          id="purchaseExponent"
          type="number"
          label="購買金額指數 (purchaseExponent)"
          :model-value="props.purchaseExponent"
          :disabled="true"
          required
          @update:model-value="(value) => emit('update:purchaseExponent', String(value))"
        />
        <Input
          id="usdAmount"
          type="number"
          label="美元金額 (usdAmount)"
          :model-value="props.usdAmount"
          @update:model-value="(value) => emit('update:usdAmount', String(value))"
        />
      </div>
    </Card>
  </section>
</template>
