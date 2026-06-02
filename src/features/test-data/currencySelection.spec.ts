import { describe, expect, it } from 'vitest'
import { applyCurrencySelection } from '@/features/test-data/currencySelection'

describe('applyCurrencySelection', () => {
  it('同步購買貨幣、匯率欄位與商家國家', () => {
    const form: Record<string, unknown> = {
      purchaseCurrency: '156',
      purchaseExponent: '2',
      merchantCountryCode: '156'
    }

    applyCurrencySelection(form, {
      numeric: '901',
      code: 'TWD',
      name: '新台幣',
      country: '台灣'
    })

    expect(form.purchaseCurrency).toBe('901')
    expect(form.currencyAlphabeticCode).toBe('TWD')
    expect(form.purchaseExponent).toBe('2')
    expect(form.merchantCountryCode).toBe('158')
    expect(form.countryAlpha2).toBe('TW')
  })
})
