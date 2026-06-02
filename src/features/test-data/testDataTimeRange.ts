import type { TestDataFormMap } from '@/features/test-data/buildTestDataDocument'
import { getTimezoneDisplayName } from '@/shared/utils/appProperties'

export type TimeRangeFormSlice = {
  currentDate: string
  enableCustomTimeRange: boolean
  enableAutoTimeRange: boolean
  startDateTime: string
  endDateTime: string
  timezone: string
}

export function formatZonedDateTime(date: Date, timezone: string): string {
  const zone = timezone === 'browser' ? Intl.DateTimeFormat().resolvedOptions().timeZone : timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: zone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  const parts = formatter.formatToParts(date)
  const lookup: Record<string, string> = {}
  for (const part of parts) {
    lookup[part.type] = part.value
  }
  return `${lookup.year}-${lookup.month}-${lookup.day}T${lookup.hour}:${lookup.minute}:${lookup.second}`
}

export function parseDateTimeLocal(value: string): Date | null {
  if (!value) return null
  const [datePart, timePartRaw] = value.trim().split('T')
  if (!datePart || !timePartRaw) return null
  const [y, m, d] = datePart.split('-').map((v) => parseInt(v, 10))
  const [hh, mm, ss] = timePartRaw.split(':').map((v) => parseInt(v, 10))
  if (!y || !m || !d) return null
  return new Date(y, (m || 1) - 1, d || 1, hh || 0, mm || 0, ss || 0)
}

export function convertToUTC(date: Date, timezone: string): Date {
  if (timezone === 'browser' || timezone === 'UTC') return date
  try {
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate()
    ).padStart(2, '0')}T${String(date.getHours()).padStart(2, '0')}:${String(
      date.getMinutes()
    ).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`
    const test = new Date(iso + 'Z')
    const fmt = new Intl.DateTimeFormat('en', { timeZone: timezone, timeZoneName: 'longOffset' })
    const parts = fmt.formatToParts(test)
    const off = parts.find((p) => p.type === 'timeZoneName')?.value || ''
    const m = off.match(/GMT([+-])(\d{2}):(\d{2})/)
    if (m) {
      const sign = m[1] === '+' ? 1 : -1
      const hh = parseInt(m[2] as string, 10)
      const mm = parseInt(m[3] as string, 10)
      const minutes = sign * (hh * 60 + mm)
      return new Date(date.getTime() - minutes * 60000)
    }
  } catch {
    /* fallback below */
  }
  return new Date(date.getTime() + date.getTimezoneOffset() * 60000)
}

export function updateCustomTimeRangeFromNow(
  form: TimeRangeFormSlice,
  batchDays: number,
  setField: (key: keyof TimeRangeFormSlice, value: string) => void
) {
  if (!form.enableCustomTimeRange || !form.enableAutoTimeRange) return
  const tz = form.timezone || 'browser'
  const days = Math.max(0, Math.floor(batchDays))
  const now = new Date()
  setField('endDateTime', formatZonedDateTime(now, tz))
  const start = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
  setField('startDateTime', formatZonedDateTime(start, tz))
}

export function getCustomRangeUtcFromForm(form: TestDataFormMap) {
  if (form.enableCustomTimeRange !== 'on') return null
  const tz = form.timezone || 'browser'
  const startLocal = parseDateTimeLocal(form.startDateTime || '')
  const endLocal = parseDateTimeLocal(form.endDateTime || '')
  if (!startLocal || !endLocal) return null
  let startUtcMs = convertToUTC(startLocal, tz).getTime()
  let endUtcMs = convertToUTC(endLocal, tz).getTime()
  if (endUtcMs < startUtcMs) {
    const temp = startUtcMs
    startUtcMs = endUtcMs
    endUtcMs = temp
  }
  const nowUtc = Date.now()
  const clampedEndUtcMs = Math.min(endUtcMs, nowUtc)
  if (startUtcMs > clampedEndUtcMs) startUtcMs = clampedEndUtcMs
  return { startUtcMs, endUtcMs, clampedEndUtcMs }
}

export function generateSharedTimestamp(form: TestDataFormMap): string {
  const useCustomRange = form.enableCustomTimeRange === 'on'
  if (useCustomRange) {
    const range = getCustomRangeUtcFromForm(form)
    if (range) {
      const span = Math.max(0, range.endUtcMs - range.startUtcMs)
      const pick = range.startUtcMs + Math.random() * (span || 1)
      return new Date(pick).toISOString()
    }
  }
  const currentDate = form.currentDate
  const tz = form.timezone || 'browser'
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`
  let hh: number
  let mm: number
  let ss: number
  if (currentDate === today) {
    hh = Math.floor(Math.random() * (now.getHours() + 1))
    mm =
      hh === now.getHours()
        ? Math.floor(Math.random() * (now.getMinutes() + 1))
        : Math.floor(Math.random() * 60)
    ss =
      hh === now.getHours() && mm === now.getMinutes()
        ? Math.floor(Math.random() * (now.getSeconds() + 1))
        : Math.floor(Math.random() * 60)
  } else {
    hh = Math.floor(Math.random() * 24)
    mm = Math.floor(Math.random() * 60)
    ss = Math.floor(Math.random() * 60)
  }
  const local = new Date(
    `${currentDate}T${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`
  )
  return convertToUTC(local, tz).toISOString()
}

export function buildTimeRangeHtml(form: TimeRangeFormSlice, batchDays: number): string {
  const currentDate = form.currentDate
  const timezone = form.timezone || 'browser'
  const useCustomRange = form.enableCustomTimeRange

  const tzName =
    timezone === 'browser'
      ? `瀏覽器時區 (${Intl.DateTimeFormat().resolvedOptions().timeZone})`
      : getTimezoneDisplayName(timezone)

  if (!currentDate && !useCustomRange) {
    return '請選擇日期'
  }

  if (useCustomRange) {
    const startLocal = parseDateTimeLocal(form.startDateTime)
    const endLocal = parseDateTimeLocal(form.endDateTime)
    if (!startLocal || !endLocal) {
      return `<div style="font-size: 0.9em;"><div><strong>選擇時區：</strong>${tzName}</div><div style="color:#666;margin-top:5px;">請選擇起訖時間</div></div>`
    }
    let startUtc = convertToUTC(startLocal, timezone).getTime()
    let endUtc = convertToUTC(endLocal, timezone).getTime()
    if (endUtc < startUtc) {
      const temp = startUtc
      startUtc = endUtc
      endUtc = temp
    }
    const nowUtc = Date.now()
    const clampedEnd = Math.min(endUtc, nowUtc)
    if (startUtc > clampedEnd) startUtc = clampedEnd
    const utcStart = new Date(startUtc).toISOString()
    const utcEnd = new Date(clampedEnd).toISOString()
    const note =
      clampedEnd !== endUtc
        ? '<small>注意：結束時間超過現在，已限制到目前時間</small>'
        : '<small>自訂時間區間</small>'
    return `<div style="font-size: 0.9em;"><div><strong>選擇時區：</strong>${tzName}</div><div><strong>UTC 時間範圍：</strong>${utcStart} ~ ${utcEnd}</div><div style="color:#666;margin-top:5px;">${note}</div></div>`
  }

  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')}`

  if (batchDays === 0) {
    const utcNow = convertToUTC(now, timezone).toISOString()
    return `<div style="font-size: 0.9em;"><div><strong>選擇時區：</strong>${tzName}</div><div><strong>UTC 時間範圍：</strong>${utcNow} ~ ${utcNow}</div><div style="color:#666;margin-top:5px;"><small>僅使用現在時間</small></div></div>`
  }

  if (batchDays === 1) {
    const startLocal = new Date(`${currentDate}T00:00:00`)
    const endLocal =
      currentDate === today
        ? new Date(
            `${currentDate}T${String(now.getHours()).padStart(2, '0')}:${String(
              now.getMinutes()
            ).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
          )
        : new Date(`${currentDate}T23:59:59`)
    const utcStart = convertToUTC(startLocal, timezone).toISOString()
    const utcEnd = convertToUTC(endLocal, timezone).toISOString()
    return `<div style="font-size: 0.9em;"><div><strong>選擇時區：</strong>${tzName}</div><div><strong>UTC 時間範圍：</strong>${utcStart} ~ ${utcEnd}</div></div>`
  }

  const startLocal = new Date(`${currentDate}T00:00:00`)
  const utcStart = convertToUTC(startLocal, timezone).toISOString()
  const endDate = new Date(startLocal)
  endDate.setDate(startLocal.getDate() - (batchDays - 1))
  const endOfEnd = new Date(
    `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(
      endDate.getDate()
    ).padStart(2, '0')}T23:59:59`
  )
  const multiEndUTC = convertToUTC(endOfEnd, timezone).toISOString()
  const dateRangeText = `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')} ~ ${currentDate}`
  return `<div style="font-size: 0.9em;"><div><strong>選擇時區：</strong>${tzName}</div><div><strong>生成天數：</strong>${batchDays} 天 (${dateRangeText})</div><div><strong>UTC 時間範圍：</strong>${utcStart} ~ ${multiEndUTC}</div></div>`
}
