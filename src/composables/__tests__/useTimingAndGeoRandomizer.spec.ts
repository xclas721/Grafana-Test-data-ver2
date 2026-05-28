import { describe, expect, it } from 'vitest'
import { randomizeTimingAndGeoFields } from '@/composables/useTimingAndGeoRandomizer'

const countryMap = {
  '156': { alpha2: 'CN', alpha3: 'CHN', name: 'China' },
  '840': { alpha2: 'US', alpha3: 'USA', name: 'United States' }
}
const currencyMap = {
  '156': { alphabetic: 'CNY', name: 'Yuan Renminbi', minorUnit: '2' },
  '840': { alphabetic: 'USD', name: 'US Dollar', minorUnit: '2' }
}

describe('useTimingAndGeoRandomizer', () => {
  it('未啟用幣別隨機時使用既有 purchaseCurrency', () => {
    const updates = randomizeTimingAndGeoFields(
      {
        purchaseCurrency: '840',
        merchantCountryCode: '156',
        merchantCountryCodeStr: '156',
        enablePurchaseCurrencyRandom: false,
        enableMerchantCountryCodeRandom: false,
        enableMerchantCountryAsiaOnly: true,
        enableExecTimeRandom: false,
        enableCreqExecTimeRandom: false,
        enableRreqExecTimeRandom: false,
        enableRbaExecTimeRandom: false,
        enableCavvExecTimeRandom: false,
        enableOtpExecTimeRandom: false,
        countryNumericMap: countryMap,
        currencyNumericMap: currencyMap,
        merchantCountryAsiaValues: ['156'],
        merchantCountryValues: ['156', '840']
      },
      () => 0
    )
    expect(updates.purchaseCurrency).toBe('840')
    expect(updates.currencyAlphabeticCode).toBe('USD')
  })
})
