import { getTransStatusReasonCandidates } from '@/composables/useTransactionStatusRules'

type MerchantOption = { name: string; mcc: string }

export type BusinessRandomInput = {
  aresTransStatus: string
  rreqTransStatus: string
  transStatusReasonMode: 'random' | 'fixed'
  transStatusReason: string
  challengeCancelRate: number
  cardScheme: string
  enablePurchaseAmountRandom: boolean
  enableCardSchemeRandom: boolean
  enableAcctNumberRandom: boolean
  enableAcquirerMerchantIdRandom: boolean
  enableAcquirerBinRandom: boolean
  enableMerchantRandom: boolean
  enableVisaScoreRandom: boolean
  enableMastercardExtension: boolean
  enableMastercardExtensionRandom: boolean
  acquirerBinOptions: readonly string[]
  merchantOptions: readonly MerchantOption[]
  // 卡號重複池：指定本筆要用的卡組織／卡號（來自批量抽樣），
  // 有值時取代隨機生成，讓同一張卡在多筆交易間重複出現以測試去重效能。
  forcedCardScheme?: string
  forcedAcctNumber?: string
}

export type PoolCard = { scheme: string; acctNumber: string }

// 隨機卡組織候選（排除 U/UL，與 Grafana 下拉一致）
export const RANDOM_CARD_SCHEMES = ['V', 'M', 'J', 'A', 'C', 'D', 'P', 'S', 'E', 'T'] as const

export type BusinessRandomResult = {
  updates: Record<string, string>
  effectiveCardScheme: string
}

function pickRandom<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)] as T
}

function randomDigits(length: number, random: () => number): string {
  let result = ''
  for (let i = 0; i < length; i++) result += Math.floor(random() * 10)
  return result
}

function randomAcctNumberByScheme(scheme: string, random: () => number): string {
  const prefixes: Record<string, string> = {
    V: '414352',
    M: '515352',
    J: '313352',
    A: '656352',
    C: '818352',
    T: '979352',
    D: '364352',
    E: '601352',
    P: '602352',
    S: '603352',
    U: '604352'
  }
  const prefix = prefixes[scheme] ?? '414352'
  return `${prefix}${randomDigits(13, random)}`
}

/**
 * 產生固定大小的卡號池。批量灌資料時每筆從池中隨機抽一張，
 * 讓卡號重複出現（模擬同一持卡人多次交易），才能測出去重 panel 的真實效能。
 * 池中每張卡自帶卡組織（前綴決定 scheme），抽用時卡組織跟著這張卡走，避免前綴與 cardScheme 不一致。
 */
export function generateCardPool(
  size: number,
  schemes: readonly string[],
  random: () => number = Math.random
): PoolCard[] {
  const schemeList = schemes.length > 0 ? schemes : ['V']
  const count = Math.max(1, Math.floor(size))
  const pool: PoolCard[] = []
  for (let i = 0; i < count; i++) {
    const scheme = schemeList[Math.floor(random() * schemeList.length)] as string
    pool.push({ scheme, acctNumber: randomAcctNumberByScheme(scheme, random) })
  }
  return pool
}

export function randomizeBusinessFields(
  input: BusinessRandomInput,
  random: () => number = Math.random
): BusinessRandomResult {
  const updates: Record<string, string> = {}
  let effectiveCardScheme = String(input.cardScheme || '').trim() || 'V'

  if (input.enablePurchaseAmountRandom) {
    updates.purchaseAmount = (random() * 990 + 10).toFixed(2)
    updates.usdAmount = (random() * 990 + 10).toFixed(6)
  }

  if (input.enableCardSchemeRandom) {
    // 有卡號池指定卡時卡組織跟著這張卡走；否則隨機。
    // U（UL）在 Grafana 卡組織下拉選單中被排除（cardSchemeVisibleInGrafanaDropdown），
    // 隨機測試資料不產生 U，避免總交易數等統計 panel 與灌入筆數對不上
    effectiveCardScheme = input.forcedCardScheme ?? pickRandom(RANDOM_CARD_SCHEMES, random)
    updates.cardScheme = effectiveCardScheme
  } else if (input.forcedCardScheme) {
    effectiveCardScheme = input.forcedCardScheme
  }

  if (input.enableAcquirerMerchantIdRandom) {
    let merchantId = randomDigits(7, random)
    if (merchantId.startsWith('0')) merchantId = `1${merchantId.substring(1)}`
    updates.acquirerMerchantId = merchantId
  }

  if (input.enableAcquirerBinRandom) {
    updates.acquirerBin = pickRandom(input.acquirerBinOptions, random)
  }

  if (input.enableMerchantRandom) {
    const option = pickRandom(input.merchantOptions, random)
    updates.merchantName = option.name
    updates.mcc = option.mcc
  }

  if (effectiveCardScheme === 'V' && input.enableVisaScoreRandom) {
    updates.visaRiskBasedAuthenticationScore = String(Math.floor(random() * 100))
  }

  if (
    effectiveCardScheme === 'M' &&
    input.enableMastercardExtension &&
    input.enableMastercardExtensionRandom
  ) {
    updates.mastercardScore = String(Math.floor(random() * 651))
    updates.mastercardDecision = pickRandom(['Not Low Risk', 'Low Risk'], random)
  }

  if (input.enableAcctNumberRandom) {
    updates.acctNumber =
      input.forcedAcctNumber ?? randomAcctNumberByScheme(effectiveCardScheme, random)
  }

  if (input.aresTransStatus === 'R') {
    if (input.transStatusReasonMode === 'random') {
      const candidates = getTransStatusReasonCandidates(effectiveCardScheme)
      updates.transStatusReason =
        candidates.length > 0
          ? (candidates[Math.floor(random() * candidates.length)] ?? '01')
          : '01'
    } else {
      const fixedReason = String(input.transStatusReason || '').trim()
      updates.transStatusReason =
        fixedReason && fixedReason !== 'NULL_VALUE' ? fixedReason : 'NULL_VALUE'
    }
  } else {
    updates.transStatusReason = 'NULL_VALUE'
  }

  if (input.aresTransStatus === 'C' && input.rreqTransStatus === 'N') {
    const shouldSetValue = random() < input.challengeCancelRate
    if (shouldSetValue) {
      updates.challengeCancel = pickRandom(
        ['01', '02', '03', '04', '05', '06', '07', '09', '10'],
        random
      )
    } else {
      updates.challengeCancel = 'NULL_VALUE'
    }
  } else {
    updates.challengeCancel = 'NULL_VALUE'
  }

  return { updates, effectiveCardScheme }
}
