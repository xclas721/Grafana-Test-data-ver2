export type BatchProgressScopeType = 'custom' | 'days' | 'now'

export type BatchProgressSummary = {
  total: number
  mode: string
  scopeType: BatchProgressScopeType
  scopeDays: number
  startDateTime: string
  endDateTime: string
  errorMixPercent: number | null
  chunkSize: number
  concurrency: number
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

/** 縮短 datetime-local 字串供 UI 顯示 */
export function formatDateTimeLocalShort(value: string): string {
  if (!value) return value
  const normalized = value.includes('T') ? value : value.replace(' ', 'T')
  const d = new Date(normalized)
  if (Number.isNaN(d.getTime())) return value
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

export function formatCustomTimeRangeLabel(startDateTime: string, endDateTime: string): string {
  return `${formatDateTimeLocalShort(startDateTime)} ~ ${formatDateTimeLocalShort(endDateTime)}`
}

export function formatCalendarDay(date: Date): string {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`
}

export function resolveScopeType(isCustomRange: boolean, days: number): BatchProgressScopeType {
  if (isCustomRange) return 'custom'
  if (days === 0) return 'now'
  return 'days'
}

export function formatCount(n: number): string {
  return n.toLocaleString()
}

export function estimateEtaSeconds(
  current: number,
  total: number,
  elapsedSec: number
): number | null {
  if (current <= 0 || total <= 0 || elapsedSec <= 0 || current >= total) return null
  const rate = current / elapsedSec
  if (rate <= 0) return null
  return Math.max(1, Math.ceil((total - current) / rate))
}

export function recordsPerSecond(current: number, elapsedSec: number): number | null {
  if (current <= 0 || elapsedSec <= 0) return null
  return Math.round((current / elapsedSec) * 10) / 10
}
