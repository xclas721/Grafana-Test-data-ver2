<script setup lang="ts">
import { Card, Input, Select, type SelectOption } from '@/shared/components'

const props = defineProps<{
  merchantName: string
  merchantCountryCode: string
  acquirerMerchantId: string
  acquirerBin: string
  mcc: string
  enableAcquirerMerchantIdRandom: boolean
  enableAcquirerBinRandom: boolean
  enableMerchantCountryCodeRandom: boolean
  enableMerchantCountryAsiaOnly: boolean
  enableMerchantRandom: boolean
}>()

const emit = defineEmits<{
  'update:merchantName': [value: string]
  'update:merchantCountryCode': [value: string]
  'update:acquirerMerchantId': [value: string]
  'update:acquirerBin': [value: string]
  'update:mcc': [value: string]
  'update:enableAcquirerMerchantIdRandom': [value: boolean]
  'update:enableAcquirerBinRandom': [value: boolean]
  'update:enableMerchantCountryCodeRandom': [value: boolean]
  'update:enableMerchantCountryAsiaOnly': [value: boolean]
  'update:enableMerchantRandom': [value: boolean]
}>()

const merchantCountryOptions: SelectOption[] = [
  { value: '156', label: '156 - 中國 (CN)' },
  { value: '158', label: '158 - 台灣 (TW)' },
  { value: '840', label: '840 - 美國 (US)' },
  { value: '076', label: '076 - 巴西 (BR)' },
  { value: '392', label: '392 - 日本 (JP)' },
  { value: '344', label: '344 - 香港 (HK)' },
  { value: '410', label: '410 - 韓國 (KR)' },
  { value: '702', label: '702 - 新加坡 (SG)' },
  { value: '036', label: '036 - 澳洲 (AU)' },
  { value: '124', label: '124 - 加拿大 (CA)' },
  { value: '978', label: '978 - 歐元區 (EU)' },
  { value: '826', label: '826 - 英國 (GB)' },
  { value: '116', label: '116 - 柬埔寨 (KH)' },
  { value: '764', label: '764 - 泰國 (TH)' },
  { value: '704', label: '704 - 越南 (VN)' },
  { value: '458', label: '458 - 馬來西亞 (MY)' },
  { value: '360', label: '360 - 印尼 (ID)' },
  { value: '608', label: '608 - 菲律賓 (PH)' }
]
</script>

<template>
  <!-- 3.商戶信息 -->
  <section id="merchant-info" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">3.商戶信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Input
            id="merchantName"
            label="商戶名稱 (merchantName)"
            :model-value="props.merchantName"
            required
            @update:model-value="(value) => emit('update:merchantName', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableMerchantRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableMerchantRandom"
              @change="
                (event) =>
                  emit('update:enableMerchantRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableMerchantRandom" class="text-sm text-base-content/60">
              隨機商戶名稱與 MCC
            </label>
          </div>
          <p class="text-xs text-error mt-2">使用預設清單隨機配對</p>
          <details class="mt-3">
            <summary class="text-xs text-base-content/60 cursor-pointer">
              商戶清單 (點我展開)
            </summary>
            <div class="mt-2 overflow-x-auto">
              <table class="table table-xs">
                <thead>
                  <tr>
                    <th>商戶</th>
                    <th>MCC</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>McDonald's</td>
                    <td>5814</td>
                  </tr>
                  <tr>
                    <td>Burger King</td>
                    <td>5814</td>
                  </tr>
                  <tr>
                    <td>KFC</td>
                    <td>5814</td>
                  </tr>
                  <tr>
                    <td>Starbucks</td>
                    <td>5812</td>
                  </tr>
                  <tr>
                    <td>Subway</td>
                    <td>5814</td>
                  </tr>
                  <tr>
                    <td>Pizza Hut</td>
                    <td>5812</td>
                  </tr>
                  <tr>
                    <td>Domino's Pizza</td>
                    <td>5812</td>
                  </tr>
                  <tr>
                    <td>Walmart Supercenter</td>
                    <td>5411</td>
                  </tr>
                  <tr>
                    <td>Costco Wholesale</td>
                    <td>5300</td>
                  </tr>
                  <tr>
                    <td>Amazon Marketplace</td>
                    <td>5262</td>
                  </tr>
                  <tr>
                    <td>Apple Store</td>
                    <td>5732</td>
                  </tr>
                  <tr>
                    <td>Microsoft Store</td>
                    <td>5732</td>
                  </tr>
                  <tr>
                    <td>IKEA</td>
                    <td>5712</td>
                  </tr>
                  <tr>
                    <td>H&amp;M</td>
                    <td>5651</td>
                  </tr>
                  <tr>
                    <td>Zara</td>
                    <td>5691</td>
                  </tr>
                  <tr>
                    <td>Nike Retail Store</td>
                    <td>5651</td>
                  </tr>
                  <tr>
                    <td>Adidas Retail Store</td>
                    <td>5651</td>
                  </tr>
                  <tr>
                    <td>Hilton Hotels</td>
                    <td>7011</td>
                  </tr>
                  <tr>
                    <td>Marriott Hotels</td>
                    <td>7011</td>
                  </tr>
                  <tr>
                    <td>Uber Rides</td>
                    <td>4121</td>
                  </tr>
                  <tr>
                    <td>Global Leisure Rewards</td>
                    <td>5816</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </details>
        </div>
        <div class="rounded-md border border-error/40 bg-error/5 p-3">
          <Select
            id="merchantCountryCode"
            label="商戶國家代碼 (merchantCountryCode)"
            :model-value="props.merchantCountryCode"
            :options="merchantCountryOptions"
            required
            @update:model-value="(value) => emit('update:merchantCountryCode', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">選擇商戶所在國家/地區</p>
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableMerchantCountryCodeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableMerchantCountryCodeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableMerchantCountryCodeRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableMerchantCountryCodeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableMerchantCountryAsiaOnly"
              class="checkbox checkbox-sm"
              :checked="props.enableMerchantCountryAsiaOnly"
              :disabled="!props.enableMerchantCountryCodeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableMerchantCountryAsiaOnly',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label
              for="enableMerchantCountryAsiaOnly"
              class="text-sm text-base-content/60"
              :class="!props.enableMerchantCountryCodeRandom ? 'opacity-50' : ''"
            >
              只隨機亞洲國家
            </label>
          </div>
        </div>
        <div>
          <Input
            id="acquirerMerchantId"
            label="收單機構商戶 ID (acquirerMerchantID)"
            :model-value="props.acquirerMerchantId"
            required
            @update:model-value="(value) => emit('update:acquirerMerchantId', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableAcquirerMerchantIdRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableAcquirerMerchantIdRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableAcquirerMerchantIdRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableAcquirerMerchantIdRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (1-9999999)，預設關閉</p>
        </div>
        <div>
          <Input
            id="acquirerBin"
            label="收單機構 BIN (acquirerBIN)"
            :model-value="props.acquirerBin"
            required
            @update:model-value="(value) => emit('update:acquirerBin', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableAcquirerBinRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableAcquirerBinRandom"
              @change="
                (event) =>
                  emit('update:enableAcquirerBinRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableAcquirerBinRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">固定清單隨機：1231234 / 1239999 / 9991234 / 9999999</p>
        </div>
        <Input
          id="mcc"
          label="商戶類別代碼 (mcc)"
          :model-value="props.mcc"
          required
          @update:model-value="(value) => emit('update:mcc', String(value))"
        />
      </div>
    </Card>
  </section>
</template>
