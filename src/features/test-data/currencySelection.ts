import { CURRENCY_COUNTRY_LABEL_MAP, CURRENCY_NUMERIC_MAP } from '@/features/test-data/testDataMaps'

export type CurrencySelectPayload = {
  numeric: string
  code: string
  name: string
  country: string
}

export function applyCurrencySelection(
  form: Record<string, unknown>,
  payload: CurrencySelectPayload
): void {
  form.purchaseCurrency = payload.numeric
  form.currencyCodeForRate = payload.code
  form.currencyAlphabeticCode = payload.code
  form.currencyNumericCode = payload.numeric
  form.currencyName = payload.name

  const currency = CURRENCY_NUMERIC_MAP[payload.numeric as keyof typeof CURRENCY_NUMERIC_MAP]
  if (currency) {
    form.purchaseExponent = currency.minorUnit
    form.currencyMinorUnit = currency.minorUnit
    form.exchangeTarget = currency.alphabetic
  }

  const countryInfo = CURRENCY_COUNTRY_LABEL_MAP[payload.country]
  if (countryInfo) {
    form.merchantCountryCode = countryInfo.numeric
    form.countryAlpha2 = countryInfo.alpha2
    form.countryAlpha3 = countryInfo.alpha3
    form.countryNumeric = countryInfo.numeric
    form.countryName = countryInfo.name
    form.merchantCountryCodeStr = countryInfo.numeric
  }
}
