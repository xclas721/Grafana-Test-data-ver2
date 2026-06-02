/**
 * Node.js 批量插入核心邏輯
 * 直接 import 前端既有的 composables（純 TypeScript，無 Vue 依賴）
 * 並發數不受瀏覽器 6 連線上限限制，可配置到 20+
 */
import {
  buildTestDataDocument,
  getFormDataFromState,
  resolveIndexName,
  type TestDataFormMap
} from '@/features/test-data/buildTestDataDocument.js'
import { attachGeoIpToDocument } from '@/features/test-data/geoIpDocument.js'
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

export const SERVER_CONCURRENCY = 20  // 瀏覽器上限 6，Node.js 無限制
export const SERVER_BULK_SIZE = 2000

function basicAuth(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

function applyUpdates(form: Record<string, unknown>, updates: Record<string, string>) {
  for (const [k, v] of Object.entries(updates)) {
    form[k] = v
  }
}

function generateOneDoc(baseForm: TestDataFormMap, indexBase: string): { ndjson: string; dateStr: string } {
  const form = { ...baseForm } as Record<string, unknown>

  // 隨機 timing / geo
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

  // 隨機 ares_transStatus / rreq_transStatus / stateMachineReason
  const statuses = rollRandomStatuses({
    activeMode: (form.mode as 'acs' | 'dss') || 'acs',
    stateMachineReasonMode: (form.stateMachineReasonMode as 'random' | 'fixed') || 'random',
    stateMachineReason: String(form.stateMachineReason || defaultStateMachineReason('acs')),
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

  // 同步狀態依賴（transStatus / transStatusReason 等）
  const deps = resolveStatusDependencies({
    activeMode: (form.mode as 'acs' | 'dss') || 'acs',
    aresTransStatus: statuses.aresTransStatus,
    rreqTransStatus: statuses.rreqTransStatus,
    transStatusReason: String(form.transStatusReason || 'NULL_VALUE'),
    stateMachineReason: statuses.stateMachineReason
  })
  form.transStatus = deps.transStatus
  form.rreqTransStatus = deps.rreqTransStatus
  form.transStatusReason = deps.transStatusReason
  form.stateMachineReason = deps.stateMachineReason

  // 隨機業務欄位（cardScheme, score, transStatusReason 等）
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

  // 隨機裝置欄位
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

  // 組裝文件
  const sharedTs = generateSharedTimestamp(form as TestDataFormMap)
  const built = buildTestDataDocument(form as TestDataFormMap, indexBase, sharedTs)

  const ndjson =
    JSON.stringify({ index: { _index: built.fullIndex } }) + '\n' +
    JSON.stringify(built.document) + '\n'

  return { ndjson, dateStr: built.utcDateStr }
}

export interface BatchInsertRequest {
  formData: TestDataFormMap
  count: number
  esUrl: string
  username: string
  password: string
  mode?: 'acs' | 'dss'
  errorMixPercent?: number
  onProgress?: (success: number, error: number, total: number) => void
}

export interface BatchInsertResult {
  success: number
  error: number
  durationMs: number
}

export async function batchInsertToEs(req: BatchInsertRequest): Promise<BatchInsertResult> {
  const { formData, count, esUrl, username, password, mode = 'acs', errorMixPercent, onProgress } = req
  const indexBase = resolveIndexName(mode)
  const auth = basicAuth(username, password)
  const bulkUrl = `${esUrl.replace(/\/$/, '')}/_bulk`

  let success = 0
  let error = 0
  const startMs = Date.now()

  const inFlight = new Set<Promise<void>>()
  let bulkLines: string[] = []
  let bulkCount = 0

  async function flush(force = false) {
    if (bulkCount === 0) return
    if (!force && bulkCount < SERVER_BULK_SIZE) return

    // 等待空出並發槽
    while (inFlight.size >= SERVER_CONCURRENCY) {
      await Promise.race([...inFlight])
    }

    const payload = bulkLines.join('') + '\n'
    const recordCount = bulkCount
    bulkLines = []
    bulkCount = 0

    const task = (async () => {
      try {
        const res = await fetch(bulkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-ndjson',
            Authorization: auth
          },
          body: payload
        })
        const json = await res.json() as { errors?: boolean }
        if (!res.ok || json.errors) {
          error += recordCount
        } else {
          success += recordCount
        }
      } catch {
        error += recordCount
      }
    })()

    inFlight.add(task)
    void task.finally(() => inFlight.delete(task))
  }

  for (let i = 0; i < count; i++) {
    try {
      const form = { ...formData }
      if (errorMixPercent != null && Math.random() * 100 < errorMixPercent) {
        applyErrorPresetToFormData(form, pickRandomBatchErrorPreset(mode))
      } else if (errorMixPercent != null) {
        applyErrorPresetToFormData(form, PRESET_NO_ERROR)
      }

      const { ndjson } = generateOneDoc(form, indexBase)
      bulkLines.push(ndjson)
      bulkCount++

      if (bulkCount >= SERVER_BULK_SIZE) {
        await flush()
        onProgress?.(success, error, count)
      }
    } catch {
      error++
    }
  }

  await flush(true)
  await Promise.all([...inFlight])

  return { success, error, durationMs: Date.now() - startMs }
}
