import { describe, expect, it } from 'vitest'
import {
  buildTestDataDocument,
  getFormDataFromState,
  resolveIndexName
} from '../buildTestDataDocument'

describe('buildTestDataDocument', () => {
  it('resolveIndexName 依模式回傳索引名', () => {
    expect(resolveIndexName('acs')).toBe('acs-transaction')
    expect(resolveIndexName('dss')).toBe('3dss-transaction')
  })

  it('getFormDataFromState 將 boolean 轉為 on/off', () => {
    const map = getFormDataFromState({ foo: true, disableX: false, bar: '1' })
    expect(map.foo).toBe('on')
    expect(map.bar).toBe('1')
    expect(map.disableX).toBeUndefined()
  })

  it('buildTestDataDocument 產出核心欄位', () => {
    const form = getFormDataFromState({
      mode: 'acs',
      aresTransStatus: 'Y',
      transStatus: 'Y',
      rreqTransStatus: 'NULL_VALUE',
      cardScheme: 'V',
      messageVersion: '2.2.0',
      issuerOid: 'oid',
      acsTransId: 'acs-id',
      execTime: '1000',
      performancePath: '/path'
    })
    const { document, indexBase, fullIndex } = buildTestDataDocument(form, 'acs-transaction')
    expect(indexBase).toBe('acs-transaction')
    expect(fullIndex).toMatch(/^acs-transaction-\d{4}-\d{2}-\d{2}$/)
    expect(document.ares_transStatus).toBe('Y')
    expect(document.acsTransID).toBe('acs-id')
    expect(Array.isArray(document.performance_metrics)).toBe(true)
    expect(document.exchange_rate).toMatchObject({
      date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T00:00:00\.000Z$/),
      '@timestamp': expect.stringMatching(/^\d{4}-\d{2}-\d{2}T00:00:02\.000Z$/)
    })
  })

  it('sharedTimestamp 覆寫時間戳與索引日期', () => {
    const form = getFormDataFromState({ mode: 'acs', aresTransStatus: 'Y', transStatus: 'Y' })
    const ts = '2024-06-15T08:30:00.000Z'
    const { document, fullIndex } = buildTestDataDocument(form, 'acs-transaction', ts)
    expect(document.first_seen_timestamp).toBe(ts)
    expect(fullIndex).toBe('acs-transaction-2024-06-15')
  })

  it('有 Visa Score 時寫入 riskAssesmentResult（等於 ares_transStatus）', () => {
    const form = getFormDataFromState({
      mode: 'acs',
      aresTransStatus: 'C',
      transStatus: 'C',
      visaRiskBasedAuthenticationScore: '85',
      enableMastercardExtension: false
    })
    const { document } = buildTestDataDocument(form, 'acs-transaction')
    expect(document.riskAssesmentResult).toBe('C')
  })

  it('啟用 Mastercard 擴展時寫入 riskAssesmentResult', () => {
    const form = getFormDataFromState({
      mode: 'acs',
      aresTransStatus: 'Y',
      transStatus: 'Y',
      enableMastercardExtension: true
    })
    const { document } = buildTestDataDocument(form, 'acs-transaction')
    expect(document.riskAssesmentResult).toBe('Y')
  })

  it('無 Visa／Mastercard Score 時不寫入 riskAssesmentResult', () => {
    const form = getFormDataFromState({
      mode: 'acs',
      aresTransStatus: 'Y',
      transStatus: 'Y',
      enableMastercardExtension: false
    })
    const { document } = buildTestDataDocument(form, 'acs-transaction')
    expect(document.riskAssesmentResult).toBeUndefined()
  })

  it('預設附加 browserGeoIP 與 deviceGeoIP', () => {
    const form = getFormDataFromState({
      mode: 'acs',
      aresTransStatus: 'Y',
      transStatus: 'Y',
      merchantCountryCode: '158',
      enableBrowserGeoIPRandom: true,
      enableDeviceGeoIPRandom: true
    })
    const { document } = buildTestDataDocument(form, 'acs-transaction')
    expect(document.browserGeoIP).toBeTruthy()
    expect(document.deviceGeoIP).toBeTruthy()
  })
})
