/** 與 getFormData() 扁平表單搭配：boolean 會序列化為 'on' / 'off' */
export function isBatchErrorMixEnabled(data: Record<string, string>): boolean {
  const v = data.enableBatchErrorMix
  return v === 'on' || v === 'true' || v === '1'
}

export const DEFAULT_BATCH_ERROR_MIX_PERCENT = 15

/**
 * 混入比例 0–100（百分比整數或小數皆可）。
 * 空字串使用預設 15：避免清空輸入框後變成 0% 仍以為是 15%。
 */
export function getBatchErrorMixPercent(data: Record<string, string>): number {
  const raw = String(data.batchErrorMixPercent ?? '').trim()
  if (raw === '') return DEFAULT_BATCH_ERROR_MIX_PERCENT
  const n = Number.parseFloat(raw.replace(',', '.'))
  if (!Number.isFinite(n)) return DEFAULT_BATCH_ERROR_MIX_PERCENT
  return Math.min(100, Math.max(0, n))
}
