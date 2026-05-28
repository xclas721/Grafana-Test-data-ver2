type SelectOption = { value: string; label: string }

export const STATE_MACHINE_REASON_OPTIONS_ACS: SelectOption[] = [
  { value: '0000', label: '0000 - 驗證成功' },
  { value: '0001', label: '0001 - 挑戰驗證成功' },
  { value: '0002', label: '0002 - 報文已受理' },
  { value: '3401', label: '3401 - RReq 連線失敗' },
  { value: '3402', label: '3402 - RReq 讀取超時' },
  { value: '9999', label: '9999 - 系統錯誤' }
]

export const STATE_MACHINE_REASON_OPTIONS_DSS: SelectOption[] = [
  { value: 'S1002', label: 'S1002 - 不支援該卡別' },
  { value: 'S3401', label: 'S3401 - AReq 連線失敗' },
  { value: 'S3402', label: 'S3402 - AReq 讀取超時' },
  { value: 'S3403', label: 'S3403 - ARes 校驗失敗' },
  { value: 'S3499', label: 'S3499 - ARes 返回錯誤' },
  { value: 'S9999', label: 'S9999 - 系統錯誤' }
]

export type ProductMode = 'acs' | 'dss'

export function getStateMachineReasonOptions(mode: ProductMode | undefined): SelectOption[] {
  return mode === 'dss' ? STATE_MACHINE_REASON_OPTIONS_DSS : STATE_MACHINE_REASON_OPTIONS_ACS
}

export function defaultStateMachineReason(mode: ProductMode | undefined): string {
  return mode === 'dss' ? 'NULL_VALUE' : '0000'
}

export function getStateMachineReasonValuesForRandom(mode: ProductMode | undefined): string[] {
  return getStateMachineReasonOptions(mode).map((o) => String(o.value))
}

export function stateMachineReasonForAresForcedPath(
  mode: ProductMode | undefined,
  path: 'y' | 'rreqY' | 'rreqNull'
): string {
  if (mode === 'dss') return 'NULL_VALUE'
  if (path === 'y') return '0000'
  if (path === 'rreqY') return '0001'
  return '0002'
}

export function reservedStateMachineReasonsForFilter(mode: ProductMode | undefined): string[] {
  return mode === 'dss' ? ['S9999'] : ['0000', '0001', '0002']
}

export function pickRandomStateMachineReasonDssWeighted(): string {
  const r = Math.random() * 100
  if (r < 90) return 'NULL_VALUE'
  if (r < 94) return 'S3401'
  if (r < 96) return 'S3402'
  if (r < 97) return 'S1002'
  if (r < 98) return 'S3403'
  if (r < 99) return 'S3499'
  return 'S9999'
}
