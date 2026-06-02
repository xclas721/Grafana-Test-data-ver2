import { computed, reactive, ref, watch } from 'vue'
import { defaultStateMachineReason } from '@/shared/constants/stateMachineReason'
import { randomizeBusinessFields } from '@/composables/useBusinessFieldRandomizer'
import { randomizeThreeDSDeviceFields } from '@/composables/useTestDataRandomizer'
import { randomizeTimingAndGeoFields } from '@/composables/useTimingAndGeoRandomizer'
import {
  computeAresWeightTotal,
  computeExpectedRates,
  computeRreqWeightTotal,
  parsePercent,
  resolveStatusDependencies,
  rollRandomStatuses
} from '@/composables/useTransactionStatusRules'
import {
  applyErrorPresetToFormData,
  pickRandomBatchErrorPreset
} from '@/shared/constants/emvThreeDSErrorPresets'
import {
  buildTestDataDocument,
  getFormDataFromState,
  resolveIndexName,
  type TestDataFormMap
} from '@/features/test-data/buildTestDataDocument'
import {
  buildTimeRangeHtml,
  updateCustomTimeRangeFromNow,
  type TimeRangeFormSlice
} from '@/features/test-data/testDataTimeRange'
import {
  applyCurrencySelection,
  type CurrencySelectPayload
} from '@/features/test-data/currencySelection'
import {
  ACQUIRER_BIN_OPTIONS,
  COUNTRY_NUMERIC_MAP,
  CURRENCY_NUMERIC_MAP,
  MERCHANT_COUNTRY_CODE_ASIA_VALUES,
  MERCHANT_COUNTRY_CODE_STR_VALUES,
  MERCHANT_MCC_OPTIONS
} from '@/features/test-data/testDataMaps'

export {
  COUNTRY_NUMERIC_MAP,
  CURRENCY_NUMERIC_MAP,
  MERCHANT_MCC_OPTIONS,
  ACQUIRER_BIN_OPTIONS
} from '@/features/test-data/testDataMaps'

const threeDSParamKeys = [
  'enableMessageCategory',
  'enableDeviceChannel',
  'enableThreeDSRequestorChallengeInd',
  'enableAuthenticationMethodRandom',
  'enableAuthenticationTypeRandom',
  'enableDeviceIpAddressRandom',
  'enableDevicePlatformRandom',
  'enableDeviceLocaleRandom',
  'enableDeviceAdvertisingIdRandom',
  'enableThreeDSCompIndRandom',
  'enableMerchantCountryCodeStrRandom'
] as const

type ThreeDSParamKey = (typeof threeDSParamKeys)[number]

function cryptoRandomUUID(): string {
  const uuid = globalThis.crypto?.randomUUID?.()
  if (uuid) return uuid
  const hex = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
  return [...hex]
    .map((c) => {
      if (c === 'x' || c === 'y') {
        const r = (Math.random() * 16) | 0
        const v = c === 'x' ? r : (r & 0x3) | 0x8
        return v.toString(16)
      }
      return c
    })
    .join('')
}

export function useTestDataForm() {
  const form = reactive({
    batchSize: '5',
    batchDays: '0',
    mode: 'acs' as 'acs' | 'dss',
    baseUrl: 'http://localhost:9200',
    username: 'elastic',
    password: '123456',
    currentDate: '',
    enableCustomTimeRange: true,
    enableAutoTimeRange: true,
    startDateTime: '',
    endDateTime: '',
    timezone: 'browser',
    issuerOid: '06b4b203-da05-73f9-256f-454929df6076',
    requestorId: '12128301823081230123',
    acsTransId: '',
    threeDSServerTransId: '',
    aresTransStatus: 'N',
    transStatus: 'N',
    rreqTransStatus: 'NULL_VALUE',
    transStatusReason: 'NULL_VALUE',
    stateMachineReason: defaultStateMachineReason('acs'),
    transStatusReasonMode: 'random' as 'random' | 'fixed',
    stateMachineReasonMode: 'random' as 'random' | 'fixed',
    challengeCancel: 'NULL_VALUE',
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
    merchantName: 'HiTRUST EMV Demo Merchant',
    merchantCountryCode: '156',
    acquirerMerchantId: '8909191',
    acquirerBin: '1231234',
    mcc: '5661',
    purchaseAmount: '100',
    purchaseCurrency: '156',
    purchaseExponent: '2',
    usdAmount: '0.13841979956813022',
    countryAlpha2: 'CN',
    countryNumeric: '156',
    countryAlpha3: 'CHN',
    countryName: 'China',
    currencyMinorUnit: '2',
    currencyName: 'Yuan Renminbi',
    currencyAlphabeticCode: 'CNY',
    currencyNumericCode: '156',
    exchangeRate: '7.2244',
    exchangeBase: 'USD',
    exchangeTarget: 'CNY',
    currencyCodeForRate: 'CNY',
    cardScheme: 'V',
    acctNumber: '4143520000000123',
    cardbin6: '414352',
    acctNumberHashed: '2hpBkDB7ELbcpebGl5RM+HWTQGx3qciOwskcbsEVKC4=',
    acctNumberMask: '414352******0123',
    cardbin8: '41435200',
    visaDafMessageExtension: 'null',
    mastercardScore: '600',
    mastercardDecision: 'Not Low Risk',
    mastercardReasonCode1: 'A',
    mastercardReasonCode2: '',
    mastercardStatus: 'success',
    visaRiskBasedAuthenticationScore: '',
    messageCategory: '01',
    messageVersion: '2.2.0',
    deviceChannel: '02',
    threeDSRequestorChallengeInd: '01',
    authenticationMethod: '02',
    authenticationType: '02',
    deviceIpAddress: '::1',
    browserIP: '::1',
    devicePlatform: 'MacIntel',
    deviceLocale: 'zh-TW',
    deviceAdvertisingId: '4d4427f20375a66287430edd54bd82d2',
    threeDSCompInd: 'Y',
    merchantCountryCodeStr: '156',
    performancePath: '/acs-auth/auth/V/2.2.0/06b4b203-da05-73f9-256f-454929df6076/001/areq',
    execTime: '5437',
    creqExecTime: '500',
    rreqExecTime: '400',
    rbaExecTime: '100',
    cavvExecTime: '20',
    otpExecTime: '50',
    errorComponent: 'NULL_VALUE',
    errorDescription: 'NULL_VALUE',
    errorCode: 'NULL_VALUE',
    errorDetail: 'NULL_VALUE',
    errorMessageType: 'NULL_VALUE',
    enableBatchErrorMix: true,
    batchErrorMixPercent: '15',
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
    enableAll3DSParamsRandom: true,
    enableMessageCategory: true,
    enableDeviceChannel: true,
    enableThreeDSRequestorChallengeInd: true,
    enableDeviceIpAddressRandom: true,
    enableDevicePlatformRandom: true,
    enableDeviceLocaleRandom: true,
    enableDeviceAdvertisingIdRandom: true,
    enableThreeDSCompIndRandom: true,
    enableAuthenticationMethodRandom: true,
    enableAuthenticationTypeRandom: true,
    enableMerchantCountryCodeStrRandom: false,
    enableBrowserGeoIPRandom: true,
    enableDeviceGeoIPRandom: true,
    disableRreqTransStatus: true,
    disableTransStatusReason: true,
    disableStateMachineReason: true,
    disableChallengeCancel: true
  })

  const outputJson = ref('')
  const batchPreviewJson = ref('')
  const timeRangeHtml = ref('請選擇日期')
  const statusMessage = ref('就緒，請調整參數後開始生成')
  const statusType = ref<'success' | 'warning' | 'info' | 'error'>('info')

  const modeText = computed(() => (form.mode === 'dss' ? '3DSS' : 'ACS'))
  const modeClass = computed(() =>
    form.mode === 'dss' ? 'mode-indicator dss' : 'mode-indicator acs'
  )

  let syncingAll3DSParams = false

  const rates = computed(() => computeExpectedRates(form))
  const aresWeightTotal = computed(() => computeAresWeightTotal(form))
  const rreqWeightTotal = computed(() => computeRreqWeightTotal(form))
  const aresWeightUnallocated = computed(() => 100 - aresWeightTotal.value)
  const rreqWeightUnallocated = computed(() => 100 - rreqWeightTotal.value)
  const isWeightValid = computed(
    () => aresWeightTotal.value === 100 && rreqWeightTotal.value === 100
  )
  const expectedTransactionSuccessRate = computed(() => rates.value.expectedTransactionSuccessRate)
  const expectedFrictionlessRate = computed(() => rates.value.expectedFrictionlessRate)
  const expectedChallengeSuccessRate = computed(() => rates.value.expectedChallengeSuccessRate)

  const disableCardScheme = computed(
    () => form.enableVisaScoreRandom || form.enableMastercardExtension
  )
  const disableMastercardExtension = computed(() => form.enableVisaScoreRandom)
  const disableVisaScoreRandom = computed(() => form.enableMastercardExtension)
  const showMastercardExtension = computed(() => form.enableMastercardExtension)

  function setStatus(message: string, type: 'success' | 'warning' | 'info' | 'error') {
    statusMessage.value = message
    statusType.value = type
  }

  function getFormData() {
    return getFormDataFromState(form as unknown as Record<string, unknown>)
  }

  function buildDocument(indexBase?: string, sharedTimestamp?: string) {
    const base = indexBase ?? resolveIndexName(form.mode)
    return buildTestDataDocument(getFormData(), base, sharedTimestamp)
  }

  function syncCountryFromMerchant(code: string) {
    const info = COUNTRY_NUMERIC_MAP[code as keyof typeof COUNTRY_NUMERIC_MAP]
    if (info) {
      form.countryAlpha2 = info.alpha2
      form.countryNumeric = code
      form.countryAlpha3 = info.alpha3
      form.countryName = info.name
      form.merchantCountryCodeStr = code
    }
  }

  function syncCurrencyFromPurchase(code: string) {
    const currency = CURRENCY_NUMERIC_MAP[code as keyof typeof CURRENCY_NUMERIC_MAP]
    if (!currency) return
    form.purchaseExponent = currency.minorUnit
    form.currencyMinorUnit = currency.minorUnit
    form.currencyName = currency.name
    form.currencyAlphabeticCode = currency.alphabetic
    form.currencyNumericCode = code
    form.exchangeTarget = currency.alphabetic
    form.currencyCodeForRate = currency.alphabetic
  }

  function onCurrencySelect(payload: CurrencySelectPayload) {
    applyCurrencySelection(form as unknown as Record<string, unknown>, payload)
    setStatus(`已選擇 ${payload.country} ${payload.name} (${payload.code})`, 'success')
  }

  function refreshTimeRangeDisplay() {
    const days = Math.max(0, Number.parseInt(form.batchDays, 10) || 0)
    timeRangeHtml.value = buildTimeRangeHtml(form as TimeRangeFormSlice, days)
  }

  function refreshAutoTimeRange() {
    const days = Math.max(0, Number.parseInt(form.batchDays, 10) || 0)
    updateCustomTimeRangeFromNow(form as TimeRangeFormSlice, days, (key, value) => {
      if (key in form) {
        ;(form as Record<string, unknown>)[key] = value
      }
    })
    refreshTimeRangeDisplay()
  }

  function syncStatusDependencies() {
    const next = resolveStatusDependencies({
      activeMode: form.mode,
      aresTransStatus: form.aresTransStatus,
      rreqTransStatus: form.rreqTransStatus,
      transStatusReason: form.transStatusReason,
      stateMachineReason: form.stateMachineReason
    })

    form.disableRreqTransStatus = next.disableRreqTransStatus
    form.disableTransStatusReason = next.disableTransStatusReason
    form.disableStateMachineReason = next.disableStateMachineReason
    form.disableChallengeCancel = next.disableChallengeCancel
    form.rreqTransStatus = next.rreqTransStatus
    form.transStatus = next.transStatus
    form.transStatusReason = next.transStatusReason
    form.stateMachineReason = next.stateMachineReason
    if (next.stateMachineReasonMode) form.stateMachineReasonMode = next.stateMachineReasonMode

    if (next.disableChallengeCancel) {
      if (form.challengeCancel !== 'NULL_VALUE') form.challengeCancel = 'NULL_VALUE'
    } else if (form.challengeCancel === 'NULL_VALUE') {
      form.challengeCancel = '01'
    }
  }

  async function updateCardInfoFromAcctNumber() {
    const acct = form.acctNumber || ''
    if (acct.length >= 6) form.cardbin6 = acct.substring(0, 6)
    if (acct.length >= 8) form.cardbin8 = acct.substring(0, 8)
    if (acct.length >= 10) {
      const first6 = acct.substring(0, 6)
      const last4 = acct.substring(acct.length - 4)
      form.acctNumberMask = `${first6}******${last4}`
      try {
        const encoder = new TextEncoder()
        const key = await crypto.subtle.importKey(
          'raw',
          encoder.encode('default_hmac_key'),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
        )
        const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(acct))
        const hashArray = new Uint8Array(signature)
        let binary = ''
        for (let i = 0; i < hashArray.length; i++)
          binary += String.fromCharCode(Number(hashArray[i]))
        form.acctNumberHashed = btoa(binary)
      } catch {
        let hash = 0
        for (let i = 0; i < acct.length; i++) {
          hash = (hash << 5) - hash + acct.charCodeAt(i)
          hash |= 0
        }
        const hashStr = Math.abs(hash).toString(16).padStart(8, '0')
        form.acctNumberHashed = btoa(hashStr + acct.substring(0, 8))
      }
    }
  }

  function syncCardSchemeToggles(scheme: string) {
    if (scheme === 'V') {
      form.enableVisaScoreRandom = true
      form.enableMastercardExtension = false
      form.enableMastercardExtensionRandom = false
      return
    }
    if (scheme === 'M') {
      form.enableVisaScoreRandom = false
      form.enableMastercardExtension = true
      form.enableMastercardExtensionRandom = true
      return
    }
    form.enableVisaScoreRandom = false
    form.enableMastercardExtension = false
    form.enableMastercardExtensionRandom = false
  }

  function applyUpdates(updates: Record<string, string>) {
    for (const [key, value] of Object.entries(updates)) {
      if (key in form) {
        ;(form as Record<string, unknown>)[key] = value
      }
    }
  }

  function generateRandomFields() {
    if (aresWeightTotal.value !== 100) {
      setStatus(`ARes 權重未分配 ${aresWeightUnallocated.value}% ，請調整至 100%`, 'warning')
      return false
    }
    if (rreqWeightTotal.value !== 100) {
      setStatus(`RReq 權重未分配 ${rreqWeightUnallocated.value}% ，請調整至 100%`, 'warning')
      return false
    }

    form.acsTransId = cryptoRandomUUID()
    form.threeDSServerTransId = cryptoRandomUUID().toLowerCase()

    const timingGeoUpdates = randomizeTimingAndGeoFields({
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
      countryNumericMap: COUNTRY_NUMERIC_MAP,
      currencyNumericMap: CURRENCY_NUMERIC_MAP,
      merchantCountryAsiaValues: [...MERCHANT_COUNTRY_CODE_ASIA_VALUES],
      merchantCountryValues: [...MERCHANT_COUNTRY_CODE_STR_VALUES]
    })
    applyUpdates(timingGeoUpdates)

    const rolledStatuses = rollRandomStatuses({
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

    const challengeCancelRate = parsePercent(form.challengeCancelRate, 8) / 100
    applyUpdates({
      aresTransStatus: rolledStatuses.aresTransStatus,
      rreqTransStatus: rolledStatuses.rreqTransStatus,
      transStatus: rolledStatuses.transStatus,
      stateMachineReason: rolledStatuses.stateMachineReason
    })

    const businessRandomResult = randomizeBusinessFields({
      aresTransStatus: rolledStatuses.aresTransStatus,
      rreqTransStatus: rolledStatuses.rreqTransStatus,
      transStatusReasonMode: form.transStatusReasonMode,
      transStatusReason: form.transStatusReason,
      challengeCancelRate,
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
      acquirerBinOptions: ACQUIRER_BIN_OPTIONS,
      merchantOptions: MERCHANT_MCC_OPTIONS
    })
    applyUpdates(businessRandomResult.updates)
    if (businessRandomResult.updates.cardScheme) {
      syncCardSchemeToggles(businessRandomResult.updates.cardScheme)
    }
    if (businessRandomResult.updates.acctNumber) {
      void updateCardInfoFromAcctNumber()
    }

    const threeDSDeviceUpdates = randomizeThreeDSDeviceFields({
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
    applyUpdates(
      Object.fromEntries(Object.entries(threeDSDeviceUpdates).map(([k, v]) => [k, String(v)]))
    )

    syncStatusDependencies()
    setStatus('隨機數據已生成', 'success')
    return true
  }

  function loadDefaults() {
    form.batchSize = '5'
    form.batchDays = '0'
    form.baseUrl = 'http://localhost:9200'
    form.username = 'elastic'
    form.password = '123456'
    form.enableCustomTimeRange = true
    form.enableAutoTimeRange = true
    form.timezone = 'browser'
    const today = new Date()
    form.currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`
    refreshAutoTimeRange()
    form.mode = 'acs'
    form.issuerOid = '06b4b203-da05-73f9-256f-454929df6076'
    form.requestorId = '12128301823081230123'
    form.acsTransId = cryptoRandomUUID()
    form.threeDSServerTransId = cryptoRandomUUID().toLowerCase()
    form.aresTransStatus = 'N'
    form.transStatus = 'N'
    form.rreqTransStatus = 'NULL_VALUE'
    form.transStatusReason = 'NULL_VALUE'
    form.stateMachineReason = defaultStateMachineReason('acs')
    form.transStatusReasonMode = 'random'
    form.stateMachineReasonMode = 'random'
    form.challengeCancel = 'NULL_VALUE'
    form.aresWeightY = '6'
    form.aresWeightN = '4'
    form.aresWeightR = '3'
    form.aresWeightC = '84'
    form.aresWeightD = '0'
    form.aresWeightA = '0'
    form.aresWeightI = '1'
    form.aresWeightS = '0'
    form.aresWeightU = '2'
    form.rreqWeightNull = '5'
    form.rreqWeightY = '86'
    form.rreqWeightN = '9'
    form.challengeCancelRate = '8'
    form.merchantName = 'HiTRUST EMV Demo Merchant'
    form.merchantCountryCode = '156'
    form.acquirerMerchantId = '8909191'
    form.acquirerBin = '1231234'
    form.mcc = '5661'
    form.purchaseAmount = '100'
    form.purchaseCurrency = '156'
    form.purchaseExponent = '2'
    form.usdAmount = '0.13841979956813022'
    form.exchangeRate = '7.2244'
    form.exchangeBase = 'USD'
    form.exchangeTarget = 'CNY'
    form.currencyCodeForRate = 'CNY'
    syncCountryFromMerchant('156')
    form.cardScheme = 'V'
    form.acctNumber = '4143520000000123'
    form.visaDafMessageExtension = 'null'
    form.mastercardScore = '600'
    form.mastercardDecision = 'Not Low Risk'
    form.mastercardReasonCode1 = 'A'
    form.mastercardReasonCode2 = ''
    form.mastercardStatus = 'success'
    form.visaRiskBasedAuthenticationScore = ''
    form.messageCategory = '01'
    form.messageVersion = '2.2.0'
    form.deviceChannel = '02'
    form.threeDSRequestorChallengeInd = '01'
    form.authenticationMethod = '02'
    form.authenticationType = '02'
    form.deviceIpAddress = '::1'
    form.browserIP = '::1'
    form.devicePlatform = 'MacIntel'
    form.deviceLocale = 'zh-TW'
    form.deviceAdvertisingId = '4d4427f20375a66287430edd54bd82d2'
    form.threeDSCompInd = 'Y'
    form.merchantCountryCodeStr = '156'
    form.performancePath = '/acs-auth/auth/V/2.2.0/06b4b203-da05-73f9-256f-454929df6076/001/areq'
    form.execTime = '5437'
    form.creqExecTime = '500'
    form.rreqExecTime = '400'
    form.rbaExecTime = '100'
    form.cavvExecTime = '20'
    form.otpExecTime = '50'
    form.errorComponent = 'NULL_VALUE'
    form.errorDescription = 'NULL_VALUE'
    form.errorCode = 'NULL_VALUE'
    form.errorDetail = 'NULL_VALUE'
    form.errorMessageType = 'NULL_VALUE'
    form.enableBatchErrorMix = true
    form.batchErrorMixPercent = '15'
    form.enablePurchaseAmountRandom = true
    form.enablePurchaseCurrencyRandom = true
    form.enableAcquirerMerchantIdRandom = true
    form.enableAcquirerBinRandom = true
    form.enableAcctNumberRandom = true
    form.enableMerchantCountryCodeRandom = true
    form.enableMerchantCountryAsiaOnly = true
    form.enableMerchantRandom = true
    form.enableCardSchemeRandom = true
    form.enableMastercardExtension = false
    form.enableMastercardExtensionRandom = false
    form.enableVisaScoreRandom = true
    form.enableExecTimeRandom = true
    form.enableCreqExecTimeRandom = true
    form.enableRreqExecTimeRandom = true
    form.enableRbaExecTimeRandom = true
    form.enableCavvExecTimeRandom = true
    form.enableOtpExecTimeRandom = true
    form.enableAll3DSParamsRandom = true
    form.enableMessageCategory = true
    form.enableDeviceChannel = true
    form.enableThreeDSRequestorChallengeInd = true
    form.enableAuthenticationMethodRandom = true
    form.enableAuthenticationTypeRandom = true
    form.enableDeviceIpAddressRandom = true
    form.enableDevicePlatformRandom = true
    form.enableDeviceLocaleRandom = true
    form.enableDeviceAdvertisingIdRandom = true
    form.enableThreeDSCompIndRandom = true
    form.enableMerchantCountryCodeStrRandom = false
    form.enableBrowserGeoIPRandom = true
    form.enableDeviceGeoIPRandom = true
    void updateCardInfoFromAcctNumber()
    syncStatusDependencies()
    outputJson.value = ''
    batchPreviewJson.value = ''
    setStatus('預設值已載入', 'success')
  }

  function generateOne() {
    const built = buildDocument()
    outputJson.value = JSON.stringify(built.document, null, 2)
    setStatus(`已輸出單筆文件（${built.fullIndex}）`, 'success')
  }

  function generateBatchPreview() {
    const count = Math.max(1, Math.min(200, Number.parseInt(form.batchSize, 10) || 1))
    const indexName = resolveIndexName(form.mode)
    const mixPercent = parsePercent(form.batchErrorMixPercent, 15)
    const rows = Array.from({ length: count }).map((_unused, index) => {
      const fd: TestDataFormMap = { ...getFormData() }
      if (form.enableBatchErrorMix && Math.random() * 100 < mixPercent) {
        applyErrorPresetToFormData(fd, pickRandomBatchErrorPreset(form.mode))
      }
      return {
        rowNo: index + 1,
        ...buildTestDataDocument(fd, indexName).document
      }
    })
    batchPreviewJson.value = JSON.stringify(rows, null, 2)
    setStatus(`已生成批次預覽，共 ${count} 筆（${indexName}）`, 'success')
  }

  watch(
    () => threeDSParamKeys.map((key) => form[key]),
    () => {
      const allChecked = threeDSParamKeys.every((key) => form[key])
      if (form.enableAll3DSParamsRandom !== allChecked) {
        syncingAll3DSParams = true
        form.enableAll3DSParamsRandom = allChecked
      }
    }
  )

  watch(
    () => form.enableAll3DSParamsRandom,
    (checked) => {
      if (syncingAll3DSParams) {
        syncingAll3DSParams = false
        return
      }
      threeDSParamKeys.forEach((key) => {
        form[key as ThreeDSParamKey] = checked
      })
    }
  )

  watch(
    () => form.mode,
    (mode) => {
      const v = String(form.stateMachineReason || '').trim()
      if (mode === 'dss') {
        if (/^[0-9]{4}$/.test(v)) form.stateMachineReason = 'S3401'
      } else if (mode === 'acs') {
        if (/^S[0-9]+$/.test(v)) form.stateMachineReason = '0000'
      }
    }
  )

  watch(
    () => [form.aresTransStatus, form.rreqTransStatus],
    () => {
      syncStatusDependencies()
    },
    { immediate: true }
  )

  watch(
    () => form.acctNumber,
    () => {
      void updateCardInfoFromAcctNumber()
    }
  )

  watch(
    () => form.deviceIpAddress,
    (value) => {
      if (value && value !== form.browserIP) form.browserIP = value
    }
  )

  watch(
    () => form.cardScheme,
    (scheme) => {
      syncCardSchemeToggles(scheme)
    },
    { immediate: true }
  )

  watch(
    () => [
      form.currentDate,
      form.enableCustomTimeRange,
      form.enableAutoTimeRange,
      form.timezone,
      form.batchDays,
      form.startDateTime,
      form.endDateTime
    ],
    () => {
      if (form.enableCustomTimeRange && form.enableAutoTimeRange) {
        refreshAutoTimeRange()
      } else {
        refreshTimeRangeDisplay()
      }
    }
  )

  watch(
    () => form.merchantCountryCode,
    (code) => {
      if (code) syncCountryFromMerchant(code)
    }
  )

  watch(
    () => form.purchaseCurrency,
    (code) => {
      if (code) syncCurrencyFromPurchase(code)
    }
  )

  if (!form.acsTransId) {
    form.acsTransId = cryptoRandomUUID()
    form.threeDSServerTransId = cryptoRandomUUID().toLowerCase()
  }
  if (!form.currentDate) {
    const today = new Date()
    form.currentDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`
    refreshAutoTimeRange()
  }

  return {
    form,
    outputJson,
    batchPreviewJson,
    timeRangeHtml,
    modeText,
    modeClass,
    statusMessage,
    statusType,
    aresWeightTotal,
    rreqWeightTotal,
    aresWeightUnallocated,
    rreqWeightUnallocated,
    isWeightValid,
    expectedTransactionSuccessRate,
    expectedFrictionlessRate,
    expectedChallengeSuccessRate,
    disableCardScheme,
    disableMastercardExtension,
    disableVisaScoreRandom,
    showMastercardExtension,
    loadDefaults,
    generateRandomFields,
    generateOne,
    generateBatchPreview,
    getFormData,
    buildDocument,
    setStatus,
    refreshAutoTimeRange,
    onCurrencySelect
  }
}
