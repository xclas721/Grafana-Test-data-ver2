<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import {
  Button,
  Card,
  Input,
  PageHeader,
  Select,
  Textarea,
  type SelectOption
} from '@/shared/components'
import { randomizeBusinessFields } from '@/composables/useBusinessFieldRandomizer'
import { randomizeThreeDSDeviceFields } from '@/composables/useTestDataRandomizer'
import { randomizeTimingAndGeoFields } from '@/composables/useTimingAndGeoRandomizer'
import {
  computeExpectedRates,
  parsePercent,
  rollRandomStatuses
} from '@/composables/useTransactionStatusRules'

const modeOptions: SelectOption[] = [
  { value: 'acs', label: 'ACS' },
  { value: 'dss', label: '3DSS' }
]
const reasonModeOptions: SelectOption[] = [
  { value: 'random', label: '全隨機' },
  { value: 'fixed', label: '固定代碼' }
]

const countryMap = {
  '156': { alpha2: 'CN', alpha3: 'CHN', name: 'China' },
  '392': { alpha2: 'JP', alpha3: 'JPN', name: 'Japan' },
  '840': { alpha2: 'US', alpha3: 'USA', name: 'United States' }
}
const currencyMap = {
  '156': { alphabetic: 'CNY', name: 'Yuan Renminbi', minorUnit: '2' },
  '392': { alphabetic: 'JPY', name: 'Yen', minorUnit: '0' },
  '840': { alphabetic: 'USD', name: 'US Dollar', minorUnit: '2' }
}
const merchantOptions = [
  { name: 'HiTRUST EMV Demo Merchant', mcc: '5661' },
  { name: 'McDonalds', mcc: '5814' },
  { name: 'Global Leisure Rewards', mcc: '5816' }
] as const
const acquirerBinOptions = ['1231234', '1239999', '9991234', '9999999'] as const

const form = reactive({
  mode: 'acs' as 'acs' | 'dss',
  stateMachineReasonMode: 'random' as 'random' | 'fixed',
  stateMachineReason: 'NULL_VALUE',
  aresWeightY: '6',
  aresWeightN: '4',
  aresWeightR: '3',
  aresWeightC: '84',
  aresWeightD: '0',
  aresWeightA: '0',
  aresWeightI: '1',
  aresWeightS: '0',
  aresWeightU: '2',
  rreqWeightNull: '5',
  rreqWeightY: '86',
  rreqWeightN: '9',
  challengeCancelRate: '8',
  cardScheme: 'V',
  transStatusReasonMode: 'random' as 'random' | 'fixed',
  transStatusReason: 'NULL_VALUE',
  purchaseCurrency: '156',
  merchantCountryCode: '156',
  merchantCountryCodeStr: '156',
  enablePurchaseAmountRandom: true,
  enableCardSchemeRandom: true,
  enableAcctNumberRandom: true,
  enableAcquirerMerchantIdRandom: true,
  enableAcquirerBinRandom: true,
  enableMerchantRandom: true,
  enableVisaScoreRandom: false,
  enableMastercardExtension: false,
  enableMastercardExtensionRandom: false,
  enablePurchaseCurrencyRandom: true,
  enableMerchantCountryCodeRandom: true,
  enableMerchantCountryAsiaOnly: true,
  enableExecTimeRandom: true,
  enableCreqExecTimeRandom: true,
  enableRreqExecTimeRandom: true,
  enableRbaExecTimeRandom: true,
  enableCavvExecTimeRandom: true,
  enableOtpExecTimeRandom: true,
  enableMessageCategory: true,
  enableDeviceChannel: true,
  enableThreeDSRequestorChallengeInd: true,
  enableDeviceIpAddressRandom: true,
  enableDevicePlatformRandom: true,
  enableDeviceLocaleRandom: true,
  enableDeviceAdvertisingIdRandom: true,
  enableThreeDSCompIndRandom: true,
  enableAuthenticationMethodRandom: true,
  enableAuthenticationTypeRandom: true
})

const outputJson = ref('')
const rates = computed(() => computeExpectedRates(form))

function generateOne() {
  const status = rollRandomStatuses({
    activeMode: form.mode,
    stateMachineReasonMode: form.stateMachineReasonMode,
    stateMachineReason: form.stateMachineReason,
    aresWeightY: form.aresWeightY,
    aresWeightN: form.aresWeightN,
    aresWeightR: form.aresWeightR,
    aresWeightC: form.aresWeightC,
    aresWeightD: form.aresWeightD,
    aresWeightA: form.aresWeightA,
    aresWeightI: form.aresWeightI,
    aresWeightS: form.aresWeightS,
    aresWeightU: form.aresWeightU,
    rreqWeightNull: form.rreqWeightNull,
    rreqWeightY: form.rreqWeightY,
    rreqWeightN: form.rreqWeightN
  })

  const business = randomizeBusinessFields({
    aresTransStatus: status.aresTransStatus,
    rreqTransStatus: status.rreqTransStatus,
    transStatusReasonMode: form.transStatusReasonMode,
    transStatusReason: form.transStatusReason,
    challengeCancelRate: parsePercent(form.challengeCancelRate, 8) / 100,
    cardScheme: form.cardScheme,
    enablePurchaseAmountRandom: form.enablePurchaseAmountRandom,
    enableCardSchemeRandom: form.enableCardSchemeRandom,
    enableAcctNumberRandom: form.enableAcctNumberRandom,
    enableAcquirerMerchantIdRandom: form.enableAcquirerMerchantIdRandom,
    enableAcquirerBinRandom: form.enableAcquirerBinRandom,
    enableMerchantRandom: form.enableMerchantRandom,
    enableVisaScoreRandom: form.enableVisaScoreRandom,
    enableMastercardExtension: form.enableMastercardExtension,
    enableMastercardExtensionRandom: form.enableMastercardExtensionRandom,
    acquirerBinOptions,
    merchantOptions
  })

  const timingGeo = randomizeTimingAndGeoFields({
    purchaseCurrency: form.purchaseCurrency,
    merchantCountryCode: form.merchantCountryCode,
    merchantCountryCodeStr: form.merchantCountryCodeStr,
    enablePurchaseCurrencyRandom: form.enablePurchaseCurrencyRandom,
    enableMerchantCountryCodeRandom: form.enableMerchantCountryCodeRandom,
    enableMerchantCountryAsiaOnly: form.enableMerchantCountryAsiaOnly,
    enableExecTimeRandom: form.enableExecTimeRandom,
    enableCreqExecTimeRandom: form.enableCreqExecTimeRandom,
    enableRreqExecTimeRandom: form.enableRreqExecTimeRandom,
    enableRbaExecTimeRandom: form.enableRbaExecTimeRandom,
    enableCavvExecTimeRandom: form.enableCavvExecTimeRandom,
    enableOtpExecTimeRandom: form.enableOtpExecTimeRandom,
    countryNumericMap: countryMap,
    currencyNumericMap: currencyMap,
    merchantCountryAsiaValues: ['156', '392'],
    merchantCountryValues: ['156', '392', '840']
  })

  const device = randomizeThreeDSDeviceFields({
    enableMessageCategory: form.enableMessageCategory,
    enableDeviceChannel: form.enableDeviceChannel,
    enableThreeDSRequestorChallengeInd: form.enableThreeDSRequestorChallengeInd,
    enableDeviceIpAddressRandom: form.enableDeviceIpAddressRandom,
    enableDevicePlatformRandom: form.enableDevicePlatformRandom,
    enableDeviceLocaleRandom: form.enableDeviceLocaleRandom,
    enableDeviceAdvertisingIdRandom: form.enableDeviceAdvertisingIdRandom,
    enableThreeDSCompIndRandom: form.enableThreeDSCompIndRandom,
    enableAuthenticationMethodRandom: form.enableAuthenticationMethodRandom,
    enableAuthenticationTypeRandom: form.enableAuthenticationTypeRandom
  })

  const sample = { ...status, ...business.updates, ...timingGeo, ...device }
  outputJson.value = JSON.stringify(sample, null, 2)
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader title="Test Data Input" subtitle="批次 2：可操作測資規則頁（先可生成樣本 JSON）" />
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <Card title="規則設定" subtitle="先調整模式與權重，生成一筆樣本">
        <div class="space-y-3">
          <Select v-model="form.mode" label="模式" :options="modeOptions" />
          <Select
            v-model="form.stateMachineReasonMode"
            label="StateMachineReason 模式"
            :options="reasonModeOptions"
          />
          <Input v-model="form.stateMachineReason" label="StateMachineReason 固定值" />
          <Input v-model="form.challengeCancelRate" label="challengeCancelRate (%)" />
          <Input v-model="form.aresWeightY" label="ARes Y 權重" />
          <Input v-model="form.aresWeightC" label="ARes C 權重" />
          <Input v-model="form.aresWeightR" label="ARes R 權重" />
          <Input v-model="form.rreqWeightY" label="RReq Y 權重" />
          <Input v-model="form.rreqWeightN" label="RReq N 權重" />
        </div>
      </Card>

      <Card title="預估指標" subtitle="依目前權重即時計算">
        <div class="space-y-2 text-sm">
          <div>交易成功率（預估）：{{ rates.expectedTransactionSuccessRate.toFixed(2) }}%</div>
          <div>免密驗證率（預估）：{{ rates.expectedFrictionlessRate.toFixed(2) }}%</div>
          <div>挑戰成功率（預估）：{{ rates.expectedChallengeSuccessRate.toFixed(2) }}%</div>
        </div>
        <div class="mt-6">
          <Button variant="primary" @click="generateOne">生成一筆樣本</Button>
        </div>
      </Card>

      <Card title="樣本輸出" subtitle="這裡先輸出單筆 JSON，後續接批次與發送流程">
        <Textarea :model-value="outputJson" label="Generated JSON" :rows="20" :disabled="true" />
      </Card>
    </div>
  </div>
</template>
