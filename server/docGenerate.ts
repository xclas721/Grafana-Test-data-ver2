import {
  buildTestDataDocument,
  resolveIndexName,
  type TestDataFormMap
} from '@/features/test-data/buildTestDataDocument.js'
import { rollRandomStatuses, resolveStatusDependencies, parsePercent } from '@/composables/useTransactionStatusRules.js'
import { randomizeBusinessFields } from '@/composables/useBusinessFieldRandomizer.js'
import { randomizeThreeDSDeviceFields } from '@/composables/useTestDataRandomizer.js'
import { randomizeTimingAndGeoFields } from '@/composables/useTimingAndGeoRandomizer.js'
import {
  applyErrorPresetToFormData,
  pickRandomBatchErrorPreset,
  PRESET_NO_ERROR
} from '@/shared/constants/emvThreeDSErrorPresets.js'
import {
  COUNTRY_NUMERIC_MAP,
  CURRENCY_NUMERIC_MAP,
  MERCHANT_COUNTRY_CODE_ASIA_VALUES,
  MERCHANT_COUNTRY_CODE_STR_VALUES,
  MERCHANT_MCC_OPTIONS,
  ACQUIRER_BIN_OPTIONS
} from '@/features/test-data/testDataMaps.js'
import { generateSharedTimestamp } from '@/features/test-data/testDataTimeRange.js'
import { defaultStateMachineReason } from '@/shared/constants/stateMachineReason.js'

function applyUpdates(form: Record<string, unknown>, updates: Record<string, string>) {
  for (const [k, v] of Object.entries(updates)) {
    form[k] = v
  }
}

function generateOneDoc(baseForm: TestDataFormMap, indexBase: string, mode: 'acs' | 'dss'): string {
  const form = { ...baseForm } as Record<string, unknown>

  const timingUpdates = randomizeTimingAndGeoFields({
    purchaseCurrency: String(form.purchaseCurrency || '156'),
    merchantCountryCode: String(form.merchantCountryCode || '156'),
    merchantCountryCodeStr: String(form.merchantCountryCodeStr || '156'),
    enablePurchaseCurrencyRandom: form.enablePurchaseCurrencyRandom === 'on',
    enableMerchantCountryCodeRandom: form.enableMerchantCountryCodeRandom === 'on',
    enableMerchantCountryAsiaOnly: form.enableMerchantCountryAsiaOnly === 'on',
    enableExecTimeRandom: form.enableExecTimeRandom === 'on',
    enableCreqExecTimeRandom: form.enableCreqExecTimeRandom === 'on',
    enableRreqExecTimeRandom: form.enableRreqExecTimeRandom === 'on',
    enableRbaExecTimeRandom: form.enableRbaExecTimeRandom === 'on',
    enableCavvExecTimeRandom: form.enableCavvExecTimeRandom === 'on',
    enableOtpExecTimeRandom: form.enableOtpExecTimeRandom === 'on',
    countryNumericMap: COUNTRY_NUMERIC_MAP,
    currencyNumericMap: CURRENCY_NUMERIC_MAP,
    merchantCountryAsiaValues: [...MERCHANT_COUNTRY_CODE_ASIA_VALUES],
    merchantCountryValues: [...MERCHANT_COUNTRY_CODE_STR_VALUES]
  })
  applyUpdates(form, timingUpdates)

  const statuses = rollRandomStatuses({
    activeMode: mode,
    stateMachineReasonMode: (form.stateMachineReasonMode as 'random' | 'fixed') || 'random',
    stateMachineReason: String(form.stateMachineReason || defaultStateMachineReason(mode)),
    aresWeightY: String(form.aresWeightY || '6'),
    aresWeightN: String(form.aresWeightN || '4'),
    aresWeightR: String(form.aresWeightR || '3'),
    aresWeightC: String(form.aresWeightC || '84'),
    aresWeightD: String(form.aresWeightD || '0'),
    aresWeightA: String(form.aresWeightA || '0'),
    aresWeightI: String(form.aresWeightI || '1'),
    aresWeightS: String(form.aresWeightS || '0'),
    aresWeightU: String(form.aresWeightU || '2'),
    rreqWeightNull: String(form.rreqWeightNull || '5'),
    rreqWeightY: String(form.rreqWeightY || '86'),
    rreqWeightN: String(form.rreqWeightN || '9')
  })
  applyUpdates(form, {
    aresTransStatus: statuses.aresTransStatus,
    rreqTransStatus: statuses.rreqTransStatus,
    transStatus: statuses.transStatus,
    stateMachineReason: statuses.stateMachineReason
  })

  const deps = resolveStatusDependencies({
    activeMode: mode,
    aresTransStatus: statuses.aresTransStatus,
    rreqTransStatus: statuses.rreqTransStatus,
    transStatusReason: String(form.transStatusReason || 'NULL_VALUE'),
    stateMachineReason: statuses.stateMachineReason
  })
  form.transStatus = deps.transStatus
  form.rreqTransStatus = deps.rreqTransStatus
  form.transStatusReason = deps.transStatusReason
  form.stateMachineReason = deps.stateMachineReason

  const challengeCancelRate = parsePercent(String(form.challengeCancelRate || '8'), 8) / 100
  const bizResult = randomizeBusinessFields({
    aresTransStatus: statuses.aresTransStatus,
    rreqTransStatus: deps.rreqTransStatus,
    transStatusReasonMode: (form.transStatusReasonMode as 'random' | 'fixed') || 'random',
    transStatusReason: String(form.transStatusReason || 'NULL_VALUE'),
    challengeCancelRate,
    cardScheme: String(form.cardScheme || 'V'),
    enablePurchaseAmountRandom: form.enablePurchaseAmountRandom === 'on',
    enableCardSchemeRandom: form.enableCardSchemeRandom === 'on',
    enableAcctNumberRandom: form.enableAcctNumberRandom === 'on',
    enableAcquirerMerchantIdRandom: form.enableAcquirerMerchantIdRandom === 'on',
    enableAcquirerBinRandom: form.enableAcquirerBinRandom === 'on',
    enableMerchantRandom: form.enableMerchantRandom === 'on',
    enableVisaScoreRandom: form.enableVisaScoreRandom === 'on',
    enableMastercardExtension: form.enableMastercardExtension === 'on',
    enableMastercardExtensionRandom: form.enableMastercardExtensionRandom === 'on',
    acquirerBinOptions: ACQUIRER_BIN_OPTIONS,
    merchantOptions: MERCHANT_MCC_OPTIONS
  })
  applyUpdates(form, bizResult.updates)

  const deviceUpdates = randomizeThreeDSDeviceFields({
    enableMessageCategory: form.enableMessageCategory === 'on',
    enableDeviceChannel: form.enableDeviceChannel === 'on',
    enableThreeDSRequestorChallengeInd: form.enableThreeDSRequestorChallengeInd === 'on',
    enableDeviceIpAddressRandom: form.enableDeviceIpAddressRandom === 'on',
    enableDevicePlatformRandom: form.enableDevicePlatformRandom === 'on',
    enableDeviceLocaleRandom: form.enableDeviceLocaleRandom === 'on',
    enableDeviceAdvertisingIdRandom: form.enableDeviceAdvertisingIdRandom === 'on',
    enableThreeDSCompIndRandom: form.enableThreeDSCompIndRandom === 'on',
    enableAuthenticationMethodRandom: form.enableAuthenticationMethodRandom === 'on',
    enableAuthenticationTypeRandom: form.enableAuthenticationTypeRandom === 'on'
  })
  applyUpdates(form, Object.fromEntries(Object.entries(deviceUpdates).map(([k, v]) => [k, String(v)])))

  const sharedTs = generateSharedTimestamp(form as TestDataFormMap)
  const built = buildTestDataDocument(form as TestDataFormMap, indexBase, sharedTs)

  return (
    JSON.stringify({ index: { _index: built.fullIndex } }) + '\n' + JSON.stringify(built.document) + '\n'
  )
}

export function generateDocsBatch(
  formData: TestDataFormMap,
  indexBase: string,
  mode: 'acs' | 'dss',
  batchCount: number,
  errorMixPercent?: number
): { lines: string[]; genErrors: number } {
  const lines: string[] = []
  let genErrors = 0
  for (let i = 0; i < batchCount; i++) {
    try {
      const form = { ...formData }
      if (errorMixPercent != null && Math.random() * 100 < errorMixPercent) {
        applyErrorPresetToFormData(form, pickRandomBatchErrorPreset(mode))
      } else if (errorMixPercent != null) {
        applyErrorPresetToFormData(form, PRESET_NO_ERROR)
      }
      lines.push(generateOneDoc(form, indexBase, mode))
    } catch {
      genErrors++
    }
  }
  return { lines, genErrors }
}

export { resolveIndexName }
