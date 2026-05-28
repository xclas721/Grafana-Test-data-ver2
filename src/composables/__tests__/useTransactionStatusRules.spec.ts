import { describe, expect, it } from 'vitest'
import {
  buildAresWeights,
  computeExpectedRates,
  parsePercent,
  rollRandomStatuses,
  resolveStatusDependencies
} from '@/composables/useTransactionStatusRules'

describe('useTransactionStatusRules', () => {
  it('parsePercent 會限制在 0 到 100', () => {
    expect(parsePercent('-10', 50)).toBe(0)
    expect(parsePercent('150', 50)).toBe(100)
    expect(parsePercent('abc', 50)).toBe(50)
  })

  it('ARes 權重全部無效時會回退預設值', () => {
    const weights = buildAresWeights({
      aresWeightY: '-1',
      aresWeightN: '-2',
      aresWeightR: '-3',
      aresWeightC: '-4',
      aresWeightD: '-5',
      aresWeightA: '-6',
      aresWeightI: '-7',
      aresWeightS: '-8',
      aresWeightU: '-9'
    })
    expect(weights[0]?.value).toBe('Y')
    expect(weights[0]?.weight).toBe(40)
  })

  it('會正確計算交易成功率', () => {
    const rates = computeExpectedRates({
      aresWeightY: '40',
      aresWeightN: '10',
      aresWeightR: '10',
      aresWeightC: '20',
      aresWeightD: '20',
      aresWeightA: '0',
      aresWeightI: '0',
      aresWeightS: '0',
      aresWeightU: '0',
      rreqWeightNull: '0',
      rreqWeightY: '50',
      rreqWeightN: '50'
    })
    expect(rates.expectedTransactionSuccessRate).toBe(60)
  })

  it('ARes=R 會啟用 transStatusReason 並補預設值', () => {
    const next = resolveStatusDependencies({
      activeMode: 'acs',
      aresTransStatus: 'R',
      rreqTransStatus: 'NULL_VALUE',
      transStatusReason: 'NULL_VALUE',
      stateMachineReason: 'NULL_VALUE'
    })
    expect(next.disableTransStatusReason).toBe(false)
    expect(next.transStatusReason).toBe('01')
  })

  it('固定模式下會保留指定 stateMachineReason', () => {
    const next = rollRandomStatuses({
      activeMode: 'acs',
      stateMachineReasonMode: 'fixed',
      stateMachineReason: 'S3401',
      aresWeightY: '100',
      aresWeightN: '0',
      aresWeightR: '0',
      aresWeightC: '0',
      aresWeightD: '0',
      aresWeightA: '0',
      aresWeightI: '0',
      aresWeightS: '0',
      aresWeightU: '0',
      rreqWeightNull: '0',
      rreqWeightY: '100',
      rreqWeightN: '0'
    })
    expect(next.stateMachineReason).toBe('S3401')
  })
})
