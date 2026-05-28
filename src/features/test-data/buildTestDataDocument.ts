export type TestDataFormMap = Record<string, string>

export function getFormDataFromState(state: Record<string, unknown>): TestDataFormMap {
  const data: TestDataFormMap = {}
  Object.entries(state).forEach(([key, value]) => {
    if (key.startsWith('disable')) return
    if (typeof value === 'boolean') {
      data[key] = value ? 'on' : 'off'
    } else {
      data[key] = String(value ?? '')
    }
  })
  return data
}

export function resolveIndexName(mode: string): string {
  return mode === 'dss' ? '3dss-transaction' : 'acs-transaction'
}

/**
 * 將表單狀態組成 Elasticsearch 文件（前置版：涵蓋 Grafana 儀表板常用欄位）。
 */
export function buildTestDataDocument(
  form: TestDataFormMap,
  indexBase: string,
  sharedTimestamp?: string
) {
  const sharedAreqMs = Number(form.execTime || Math.floor(Math.random() * 701 + 800))
  const cardSchemeKey = String(form.cardScheme || 'V').trim() || 'V'
  const nowIso = sharedTimestamp ?? new Date().toISOString()
  const utcDateStr = nowIso.split('T')[0] ?? ''
  const fullIndex = `${indexBase}-${utcDateStr}`

  const performance_metrics: Array<{ path?: string; execTime?: number }> = []
  if (indexBase.includes('3dss-transaction')) {
    performance_metrics.push({ path: `${cardSchemeKey}_DS_URL`, execTime: sharedAreqMs })
  }
  performance_metrics.push(
    { path: form.performancePath, execTime: Number(form.execTime || 0) },
    {
      path: 'CardSchemeService.caculateCavv',
      execTime: Number(form.cavvExecTime || Math.floor(Math.random() * 21 + 10))
    },
    {
      path: 'VerificationCodeService.sendVerificationCode',
      execTime: Number(form.otpExecTime || Math.floor(Math.random() * 61 + 20))
    },
    {
      path: `/challenge/brw/${form.cardScheme}/${form.messageVersion}/${form.issuerOid}/1/${form.acsTransId}/creq`,
      execTime: Number(form.creqExecTime || Math.floor(Math.random() * 501 + 300))
    },
    {
      path: `/acs-auth/auth/${form.cardScheme}/${form.messageVersion}/${form.issuerOid}/001/areq`,
      execTime: sharedAreqMs
    },
    {
      path: `/acs-auth/auth/${form.cardScheme}/${form.messageVersion}/${form.issuerOid}/001/rreq`,
      execTime: Number(form.rreqExecTime || Math.floor(Math.random() * 401 + 200))
    },
    {
      path: 'RiskEvaluationService.evaluate',
      execTime: Number(form.rbaExecTime || Math.floor(Math.random() * 151 + 50))
    }
  )

  const doc: Record<string, unknown> = {
    last_update_timestamp: nowIso,
    first_seen_timestamp: nowIso,
    messageCategory: form.messageCategory,
    messageVersion: form.messageVersion,
    deviceChannel: form.deviceChannel,
    merchantName: form.merchantName,
    merchantCountryCode: form.merchantCountryCode,
    mcc: form.mcc,
    acquirerMerchantID: String(form.acquirerMerchantId || ''),
    acquirerBIN: form.acquirerBin,
    purchaseAmount: String(form.purchaseAmount || ''),
    purchaseCurrency: form.purchaseCurrency,
    purchaseExponent: String(form.purchaseExponent || ''),
    usdAmount: Number(form.usdAmount || 0),
    ares_transStatus: form.aresTransStatus,
    transStatus: form.transStatus,
    rreq_transStatus: form.rreqTransStatus,
    transStatusReason: form.transStatusReason,
    stateMachineReason:
      indexBase.includes('3dss-transaction') &&
      (!form.stateMachineReason || String(form.stateMachineReason).trim() === 'NULL_VALUE')
        ? undefined
        : form.stateMachineReason,
    cardScheme: form.cardScheme,
    requestorId: form.requestorId,
    acctNumberHashed: form.acctNumberHashed,
    acctNumberMask: form.acctNumberMask,
    cardbin6: form.cardbin6,
    cardbin8: form.cardbin8,
    performance_metrics,
    browserIP: form.browserIP,
    errorComponent: form.errorComponent,
    errorDescription: form.errorDescription,
    errorCode: form.errorCode,
    errorDetail: form.errorDetail,
    errorMessageType: form.errorMessageType,
    challengeCancel:
      form.challengeCancel && form.challengeCancel !== 'NULL_VALUE'
        ? form.challengeCancel
        : undefined,
    threedsRequestorChlgInd: form.threeDSRequestorChallengeInd
  }

  if (form.deviceIpAddress?.trim()) doc.deviceIpAddress = form.deviceIpAddress
  if (form.devicePlatform?.trim()) doc.devicePlatform = form.devicePlatform
  if (form.deviceLocale?.trim()) doc.deviceLocale = form.deviceLocale
  if (form.deviceAdvertisingId?.trim()) doc.deviceAdvertisingId = form.deviceAdvertisingId
  if (form.threeDSCompInd?.trim()) doc.threeDSCompInd = form.threeDSCompInd
  if (form.merchantCountryCodeStr?.trim()) doc.merchantCountryCodeStr = form.merchantCountryCodeStr
  if (form.authenticationMethod && form.authenticationMethod !== 'NULL_VALUE') {
    doc.authenticationMethod = form.authenticationMethod
  }
  if (form.authenticationType && form.authenticationType !== 'NULL_VALUE') {
    doc.authenticationType = form.authenticationType
  }

  if (indexBase.includes('acs-transaction')) {
    doc.acsTransID = form.acsTransId
    doc.issuerOid = form.issuerOid
  }
  if (indexBase.includes('3dss-transaction')) {
    doc.threeDSServerTransID = form.threeDSServerTransId
  }

  doc['purchaseCurrency-country_info'] = {
    'ISO4217-currency_minor_unit': form.currencyMinorUnit,
    'ISO4217-currency_name': form.currencyName,
    'ISO4217-currency_alphabetic_code': form.currencyAlphabeticCode,
    'ISO4217-currency_numeric_code': form.currencyNumericCode
  }
  doc.merchantCountryCode_country_info = {
    'ISO3166-1-Alpha-2': form.countryAlpha2,
    'ISO3166-1-numeric': form.countryNumeric,
    'ISO3166-1-Alpha-3': form.countryAlpha3,
    official_name_en: form.countryName
  }
  doc.purchaseCurrencyStr = form.purchaseCurrency
  if (form.currencyCodeForRate?.trim()) {
    doc.currencyCodeForRate = form.currencyCodeForRate
  }
  doc.exchangeKey = `${form.currencyCodeForRate || form.currencyAlphabeticCode || 'CNY'}-${nowIso.split('T')[0]}`
  doc.exchange_rate = {
    date: `${nowIso.split('T')[0]}T00:00:00.000Z`,
    '@timestamp': `${nowIso.split('T')[0]}T00:00:02.000Z`,
    rate: form.exchangeRate,
    target: form.exchangeTarget,
    base: form.exchangeBase
  }
  doc.visaDafMessageExtension = null
  if (form.visaRiskBasedAuthenticationScore?.trim()) {
    doc.visaScoreMessageExtension = {
      visaRiskBasedAuthenticationScore: Number.parseInt(form.visaRiskBasedAuthenticationScore, 10)
    }
  } else {
    doc.visaScoreMessageExtension = null
  }
  if (form.enableMastercardExtension === 'on') {
    doc.mastercardMessageExtension = {
      score: Number.parseInt(form.mastercardScore || '600', 10),
      reasonCode2: form.mastercardReasonCode2 || '',
      reasonCode1: form.mastercardReasonCode1 || 'A',
      decision: form.mastercardDecision || 'Not Low Risk',
      status: form.mastercardStatus || 'success'
    }
  } else {
    doc.mastercardMessageExtension = null
  }

  return { document: doc, indexBase, fullIndex, utcDateStr }
}
