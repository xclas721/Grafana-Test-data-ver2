import {
  alignStatusesForSystemMonitorError,
  defaultStateMachineReason,
  isSystemMonitorExternalErrorCode,
  pickRandomStateMachineReasonAcsWeighted,
  pickRandomStateMachineReasonDssWeighted,
  stateMachineReasonForAresForcedPath,
  type ProductMode
} from '@/shared/constants/stateMachineReason'

export type AresWeightInput = {
  aresWeightY: string
  aresWeightN: string
  aresWeightR: string
  aresWeightC: string
  aresWeightD: string
  aresWeightA: string
  aresWeightI: string
  aresWeightS: string
  aresWeightU: string
}

export type RreqWeightInput = {
  rreqWeightNull: string
  rreqWeightY: string
  rreqWeightN: string
}

export const DEFAULT_ARES_STATUS_WEIGHTS = [
  { value: 'Y', weight: 40 },
  { value: 'N', weight: 5 },
  { value: 'R', weight: 5 },
  { value: 'C', weight: 25 },
  { value: 'D', weight: 5 },
  { value: 'A', weight: 5 },
  { value: 'I', weight: 5 },
  { value: 'S', weight: 5 },
  { value: 'U', weight: 5 }
]

export const DEFAULT_RREQ_WEIGHTS = [
  { value: 'NULL_VALUE', weight: 0 },
  { value: 'Y', weight: 80 },
  { value: 'N', weight: 20 }
] as const

export function parsePercent(value: string, fallback: number): number {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  if (parsed < 0) return 0
  if (parsed > 100) return 100
  return Math.round(parsed)
}

export function buildAresWeights(input: AresWeightInput): Array<{ value: string; weight: number }> {
  const defaults = { Y: 40, N: 5, R: 5, C: 25, D: 5, A: 5, I: 5, S: 5, U: 5 } as const
  const items = [
    { value: 'Y', weight: parsePercent(input.aresWeightY, defaults.Y) },
    { value: 'N', weight: parsePercent(input.aresWeightN, defaults.N) },
    { value: 'R', weight: parsePercent(input.aresWeightR, defaults.R) },
    { value: 'C', weight: parsePercent(input.aresWeightC, defaults.C) },
    { value: 'D', weight: parsePercent(input.aresWeightD, defaults.D) },
    { value: 'A', weight: parsePercent(input.aresWeightA, defaults.A) },
    { value: 'I', weight: parsePercent(input.aresWeightI, defaults.I) },
    { value: 'S', weight: parsePercent(input.aresWeightS, defaults.S) },
    { value: 'U', weight: parsePercent(input.aresWeightU, defaults.U) }
  ]
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  if (total <= 0) return DEFAULT_ARES_STATUS_WEIGHTS
  return items
}

export function computeAresWeightTotal(input: AresWeightInput): number {
  return (
    parsePercent(input.aresWeightY, 0) +
    parsePercent(input.aresWeightN, 0) +
    parsePercent(input.aresWeightR, 0) +
    parsePercent(input.aresWeightC, 0) +
    parsePercent(input.aresWeightD, 0) +
    parsePercent(input.aresWeightA, 0) +
    parsePercent(input.aresWeightI, 0) +
    parsePercent(input.aresWeightS, 0) +
    parsePercent(input.aresWeightU, 0)
  )
}

export function computeRreqWeightTotal(input: RreqWeightInput): number {
  return (
    parsePercent(input.rreqWeightNull, 0) +
    parsePercent(input.rreqWeightY, 0) +
    parsePercent(input.rreqWeightN, 0)
  )
}

export function computeExpectedRates(input: AresWeightInput & RreqWeightInput): {
  expectedFrictionlessRate: number
  expectedChallengeSuccessRate: number
  expectedTransactionSuccessRate: number
} {
  const aresTotal = computeAresWeightTotal(input) || 100
  const rreqTotal = computeRreqWeightTotal(input) || 100
  const y = parsePercent(input.aresWeightY, 0)
  const a = parsePercent(input.aresWeightA, 0)
  const i = parsePercent(input.aresWeightI, 0)
  const c = parsePercent(input.aresWeightC, 0)
  const d = parsePercent(input.aresWeightD, 0)
  const rreqY = parsePercent(input.rreqWeightY, 0)
  const rreqSuccessRate = rreqY / rreqTotal

  return {
    expectedFrictionlessRate: ((y + a + i) / aresTotal) * 100,
    expectedChallengeSuccessRate: (rreqY / rreqTotal) * 100,
    expectedTransactionSuccessRate: ((y + a + i + (c + d) * rreqSuccessRate) / aresTotal) * 100
  }
}

export function getTransStatusReasonCandidates(cardScheme: string): string[] {
  const reasons: string[] = []
  for (let i = 1; i <= 26; i++) reasons.push(String(i).padStart(2, '0'))

  if (cardScheme === 'A') {
    reasons.push('80', '81', '82')
  } else if (cardScheme === 'V') {
    for (let i = 80; i <= 92; i++) reasons.push(String(i))
  } else if (cardScheme === 'M') {
    reasons.push('80', '81', '82', '83', '84', '87', '88', '98')
  }

  return reasons
}

function pickWeightedValue(items: Array<{ value: string; weight: number }>): string {
  const total = items.reduce((sum, item) => sum + item.weight, 0)
  const r = Math.random() * total
  let acc = 0
  for (const item of items) {
    acc += item.weight
    if (r <= acc) return item.value
  }
  return items[items.length - 1]?.value ?? ''
}

type RollRandomStatusesInput = AresWeightInput &
  RreqWeightInput & {
    activeMode?: ProductMode
    stateMachineReasonMode: 'random' | 'fixed'
    stateMachineReason: string
  }

type RollRandomStatusesOutput = {
  aresTransStatus: string
  rreqTransStatus: string
  transStatus: string
  stateMachineReason: string
}

export function rollRandomStatuses(input: RollRandomStatusesInput): RollRandomStatusesOutput {
  const aresTransStatus = pickWeightedValue(buildAresWeights(input))

  let rreqTransStatus = 'NULL_VALUE'
  let transStatus = aresTransStatus
  if (aresTransStatus === 'C' || aresTransStatus === 'D') {
    const defaultRreqWeights = {
      nullValue: DEFAULT_RREQ_WEIGHTS[0].weight,
      y: DEFAULT_RREQ_WEIGHTS[1].weight,
      n: DEFAULT_RREQ_WEIGHTS[2].weight
    }
    const rreqItems = [
      {
        value: 'NULL_VALUE',
        weight: parsePercent(input.rreqWeightNull, defaultRreqWeights.nullValue)
      },
      { value: 'Y', weight: parsePercent(input.rreqWeightY, defaultRreqWeights.y) },
      { value: 'N', weight: parsePercent(input.rreqWeightN, defaultRreqWeights.n) }
    ]
    const rreqTotal = rreqItems.reduce((sum, item) => sum + item.weight, 0)
    rreqTransStatus =
      rreqTotal > 0 ? pickWeightedValue(rreqItems) : pickWeightedValue([...DEFAULT_RREQ_WEIGHTS])
    transStatus = rreqTransStatus === 'NULL_VALUE' ? aresTransStatus : rreqTransStatus
  }

  const fixedReason = String(input.stateMachineReason || '').trim()
  let stateMachineReason: string
  if (input.stateMachineReasonMode === 'random') {
    if (input.activeMode === 'dss') {
      stateMachineReason = pickRandomStateMachineReasonDssWeighted()
    } else if (aresTransStatus === 'Y') {
      stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'y')
    } else if (aresTransStatus === 'C' || aresTransStatus === 'D') {
      if (rreqTransStatus === 'Y') {
        stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'rreqY')
      } else if (rreqTransStatus === 'NULL_VALUE') {
        stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'rreqNull')
      } else {
        stateMachineReason = pickRandomStateMachineReasonAcsWeighted()
      }
    } else {
      stateMachineReason = pickRandomStateMachineReasonAcsWeighted()
    }
  } else {
    stateMachineReason =
      fixedReason && fixedReason !== 'NULL_VALUE'
        ? fixedReason
        : defaultStateMachineReason(input.activeMode)
  }

  const aligned = alignStatusesForSystemMonitorError(stateMachineReason, {
    aresTransStatus,
    rreqTransStatus,
    transStatus
  })

  return {
    aresTransStatus: aligned.aresTransStatus,
    rreqTransStatus: aligned.rreqTransStatus,
    transStatus: aligned.transStatus,
    stateMachineReason
  }
}

type DependencyInput = {
  activeMode?: ProductMode
  aresTransStatus: string
  rreqTransStatus: string
  transStatusReason: string
  stateMachineReason: string
}

export type DependencyOutput = {
  transStatus: string
  rreqTransStatus: string
  transStatusReason: string
  stateMachineReason: string
  stateMachineReasonMode?: 'fixed'
  aresTransStatus?: string
  disableRreqTransStatus: boolean
  disableTransStatusReason: boolean
  disableStateMachineReason: boolean
  disableChallengeCancel: boolean
}

export function resolveStatusDependencies(input: DependencyInput): DependencyOutput {
  const ares = input.aresTransStatus
  let rreqTransStatus = input.rreqTransStatus
  let transStatus: string
  let transStatusReason = input.transStatusReason
  let stateMachineReason = input.stateMachineReason
  let stateMachineReasonMode: 'fixed' | undefined

  const fixedSystemMonitorError =
    input.activeMode !== 'dss' && isSystemMonitorExternalErrorCode(input.stateMachineReason)

  let disableRreqTransStatus = true
  let disableTransStatusReason = true
  let disableStateMachineReason = false
  let disableChallengeCancel = true

  if (ares === 'C' || ares === 'D') {
    disableRreqTransStatus = false
    transStatus = rreqTransStatus
  } else {
    rreqTransStatus = 'NULL_VALUE'
    transStatus = ares
  }

  if (ares === 'R' || ares === 'N') {
    disableTransStatusReason = false
    if (transStatusReason === 'NULL_VALUE') transStatusReason = '01'
  } else {
    transStatusReason = 'NULL_VALUE'
  }

  if (fixedSystemMonitorError) {
    stateMachineReason = input.stateMachineReason
    stateMachineReasonMode = 'fixed'
    disableStateMachineReason = false
  } else if (input.activeMode === 'dss') {
    disableStateMachineReason = false
  } else if (ares === 'Y') {
    disableStateMachineReason = true
    stateMachineReasonMode = 'fixed'
    stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'y')
  } else if (ares === 'C' || ares === 'D') {
    if (rreqTransStatus === 'Y') {
      disableStateMachineReason = true
      stateMachineReasonMode = 'fixed'
      stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'rreqY')
    } else if (rreqTransStatus === 'NULL_VALUE') {
      disableStateMachineReason = true
      stateMachineReasonMode = 'fixed'
      stateMachineReason = stateMachineReasonForAresForcedPath(input.activeMode, 'rreqNull')
    } else if (stateMachineReason === 'NULL_VALUE') {
      stateMachineReason = defaultStateMachineReason(input.activeMode)
    }
  } else if (stateMachineReason === 'NULL_VALUE') {
    stateMachineReason = defaultStateMachineReason(input.activeMode)
  }

  if (ares === 'C' && rreqTransStatus === 'N') {
    disableChallengeCancel = false
  }

  let aresTransStatusOut: string | undefined
  if (input.activeMode !== 'dss' && isSystemMonitorExternalErrorCode(stateMachineReason)) {
    const aligned = alignStatusesForSystemMonitorError(stateMachineReason, {
      aresTransStatus: ares,
      rreqTransStatus,
      transStatus
    })
    if (aligned.aresTransStatus !== ares) aresTransStatusOut = aligned.aresTransStatus
    rreqTransStatus = aligned.rreqTransStatus
    transStatus = aligned.transStatus
    if (aligned.aresTransStatus === 'C' && aligned.rreqTransStatus === 'N') {
      disableChallengeCancel = false
      disableRreqTransStatus = false
    }
  }

  return {
    transStatus,
    rreqTransStatus,
    transStatusReason,
    stateMachineReason,
    stateMachineReasonMode,
    aresTransStatus: aresTransStatusOut,
    disableRreqTransStatus,
    disableTransStatusReason,
    disableStateMachineReason,
    disableChallengeCancel
  }
}
