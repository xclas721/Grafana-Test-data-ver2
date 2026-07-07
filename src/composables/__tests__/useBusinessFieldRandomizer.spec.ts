import { describe, expect, it } from 'vitest'
import { randomizeBusinessFields } from '@/composables/useBusinessFieldRandomizer'

const baseInput = {
  aresTransStatus: 'N',
  rreqTransStatus: 'NULL_VALUE',
  transStatusReasonMode: 'random' as const,
  transStatusReason: 'NULL_VALUE',
  challengeCancelRate: 0.08,
  cardScheme: 'V',
  enablePurchaseAmountRandom: false,
  enableCardSchemeRandom: false,
  enableAcctNumberRandom: false,
  enableAcquirerMerchantIdRandom: false,
  enableAcquirerBinRandom: false,
  enableMerchantRandom: false,
  enableVisaScoreRandom: false,
  enableMastercardExtension: false,
  enableMastercardExtensionRandom: false,
  acquirerBinOptions: ['1231234', '9999999'],
  merchantOptions: [{ name: 'Demo', mcc: '5661' }]
}

describe('useBusinessFieldRandomizer', () => {
  it('ARes 不是 R 時 transStatusReason 應為 NULL_VALUE', () => {
    const result = randomizeBusinessFields(baseInput, () => 0)
    expect(result.updates.transStatusReason).toBe('NULL_VALUE')
  })

  it('啟用卡號隨機時會依 cardScheme 產生帳號', () => {
    const result = randomizeBusinessFields(
      { ...baseInput, enableAcctNumberRandom: true, cardScheme: 'M' },
      () => 0
    )
    expect(result.updates.acctNumber?.startsWith('515352')).toBe(true)
  })

  it('卡組織隨機不會被擴展隨機覆寫', () => {
    const result = randomizeBusinessFields(
      {
        ...baseInput,
        cardScheme: 'V',
        enableCardSchemeRandom: true,
        enableVisaScoreRandom: true
      },
      () => 2 / 11
    )
    expect(result.updates.cardScheme).toBe('J')
    expect(result.updates.visaRiskBasedAuthenticationScore).toBeUndefined()
  })

  it('卡號依最終卡組織產生', () => {
    const result = randomizeBusinessFields(
      {
        ...baseInput,
        cardScheme: 'V',
        enableCardSchemeRandom: true,
        enableAcctNumberRandom: true,
        enableVisaScoreRandom: true
      },
      () => 2 / 11
    )
    expect(result.updates.cardScheme).toBe('J')
    expect(result.updates.acctNumber?.startsWith('313352')).toBe(true)
  })
})
