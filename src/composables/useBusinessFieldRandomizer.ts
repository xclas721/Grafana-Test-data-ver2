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
}

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
    effectiveCardScheme = pickRandom(
      ['V', 'M', 'J', 'A', 'C', 'D', 'P', 'S', 'E', 'T', 'U'],
      random
    )
    updates.cardScheme = effectiveCardScheme
  }

  if (input.enableAcctNumberRandom) {
    updates.acctNumber = randomAcctNumberByScheme(effectiveCardScheme, random)
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

  if (input.enableVisaScoreRandom) {
    updates.visaRiskBasedAuthenticationScore = String(Math.floor(random() * 100))
    updates.cardScheme = 'V'
    effectiveCardScheme = 'V'
  }

  if (input.enableMastercardExtension && input.enableMastercardExtensionRandom) {
    updates.mastercardScore = String(Math.floor(random() * 651))
    updates.mastercardDecision = pickRandom(['Not Low Risk', 'Low Risk'], random)
    updates.cardScheme = 'M'
    effectiveCardScheme = 'M'
  }

  if (input.aresTransStatus === 'R' || input.aresTransStatus === 'N') {
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
