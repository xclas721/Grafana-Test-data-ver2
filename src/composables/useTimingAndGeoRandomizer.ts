type CountryInfo = { alpha2: string; alpha3: string; name: string }
type CurrencyInfo = { alphabetic: string; name: string; minorUnit: string }

export type TimingAndGeoInput = {
  purchaseCurrency: string
  merchantCountryCode: string
  merchantCountryCodeStr: string
  enablePurchaseCurrencyRandom: boolean
  enableMerchantCountryCodeRandom: boolean
  enableMerchantCountryAsiaOnly: boolean
  enableExecTimeRandom: boolean
  enableCreqExecTimeRandom: boolean
  enableRreqExecTimeRandom: boolean
  enableRbaExecTimeRandom: boolean
  enableCavvExecTimeRandom: boolean
  enableOtpExecTimeRandom: boolean
  countryNumericMap: Record<string, CountryInfo>
  currencyNumericMap: Record<string, CurrencyInfo>
  merchantCountryAsiaValues: readonly string[]
  merchantCountryValues: readonly string[]
}

function pickRandom<T>(values: readonly T[], random: () => number): T {
  return values[Math.floor(random() * values.length)] as T
}

export function randomizeTimingAndGeoFields(
  input: TimingAndGeoInput,
  random: () => number = Math.random
): Record<string, string> {
  const updates: Record<string, string> = {}

  if (input.enablePurchaseCurrencyRandom) {
    const currencyKeys = Object.keys(input.currencyNumericMap)
    updates.purchaseCurrency = currencyKeys[Math.floor(random() * currencyKeys.length)] || '156'
  } else {
    updates.purchaseCurrency = input.purchaseCurrency || '156'
  }

  const currencyInfo = input.currencyNumericMap[updates.purchaseCurrency]
  updates.currencyNumericCode = updates.purchaseCurrency
  if (currencyInfo) {
    updates.currencyAlphabeticCode = currencyInfo.alphabetic
    updates.currencyName = currencyInfo.name
    updates.currencyMinorUnit = currencyInfo.minorUnit
    updates.currencyCodeForRate = currencyInfo.alphabetic
    updates.purchaseExponent = currencyInfo.minorUnit
  }

  const countryPool = input.enableMerchantCountryAsiaOnly
    ? input.merchantCountryAsiaValues
    : input.merchantCountryValues
  const merchantCountryCode = input.enableMerchantCountryCodeRandom
    ? pickRandom(countryPool, random) || '156'
    : input.merchantCountryCode || input.merchantCountryCodeStr || '156'

  updates.merchantCountryCode = merchantCountryCode
  updates.merchantCountryCodeStr = merchantCountryCode
  updates.countryNumeric = merchantCountryCode
  const countryInfo = input.countryNumericMap[merchantCountryCode]
  if (countryInfo) {
    updates.countryAlpha2 = countryInfo.alpha2
    updates.countryAlpha3 = countryInfo.alpha3
    updates.countryName = countryInfo.name
  }

  if (input.enableExecTimeRandom) updates.execTime = String(Math.floor(random() * 5000 + 1000))
  if (input.enableCreqExecTimeRandom)
    updates.creqExecTime = String(Math.floor(random() * 500 + 300))
  if (input.enableRreqExecTimeRandom)
    updates.rreqExecTime = String(Math.floor(random() * 400 + 200))
  if (input.enableRbaExecTimeRandom) updates.rbaExecTime = String(Math.floor(random() * 150 + 50))
  if (input.enableCavvExecTimeRandom) updates.cavvExecTime = String(Math.floor(random() * 21 + 10))
  if (input.enableOtpExecTimeRandom) updates.otpExecTime = String(Math.floor(random() * 61 + 20))

  return updates
}
