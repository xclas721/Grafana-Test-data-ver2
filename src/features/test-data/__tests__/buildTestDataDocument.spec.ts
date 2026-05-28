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
  })

  it('sharedTimestamp 覆寫時間戳與索引日期', () => {
    const form = getFormDataFromState({ mode: 'acs', aresTransStatus: 'Y', transStatus: 'Y' })
    const ts = '2024-06-15T08:30:00.000Z'
    const { document, fullIndex } = buildTestDataDocument(form, 'acs-transaction', ts)
    expect(document.first_seen_timestamp).toBe(ts)
    expect(fullIndex).toBe('acs-transaction-2024-06-15')
  })
})
