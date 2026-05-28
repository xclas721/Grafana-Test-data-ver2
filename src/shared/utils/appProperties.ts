// 應用屬性工具
import { DateTime } from 'luxon'

export interface LocaleOption {
  label: string
  value: string
  backendValue: string
}

export interface TimezoneOption {
  label: string
  value: string
}

interface TimezoneMeta {
  value: string
  name: string
}

const supportLocale: LocaleOption[] = [
  { label: '繁體中文', value: 'zh-TW', backendValue: 'zh_TW' },
  { label: '简体中文', value: 'zh-CN', backendValue: 'zh_CN' },
  { label: 'English', value: 'en-US', backendValue: 'en_US' }
]

/**
 * 取得支援的語言列表
 */
export function getSupportLocaleList(): LocaleOption[] {
  return supportLocale
}

/**
 * 檢查 Locale，回傳支援列表內的 locale
 * @param localeValue 語言值
 * @returns 標準化的語言值
 */
export function getLocaleValue(localeValue: string): string {
  // 處理 'en' 語系
  if (localeValue === 'en') {
    return 'en-US'
  }

  const returnLocale = supportLocale.find((item) => item.value === localeValue)
  return returnLocale ? returnLocale.value : 'en-US'
}

/**
 * 檢查 Locale，回傳支援列表內的 backend locale
 * @param localeValue 語言值
 * @returns 後端格式的語言值
 */
export function getLocaleBackendValue(localeValue: string): string {
  const returnLocale = supportLocale.find((item) => item.value === localeValue)
  return returnLocale ? returnLocale.backendValue : 'en_US'
}

/**
 * 取得語言標籤
 * @param localeValue 語言值
 * @returns 語言標籤
 */
export function getLocaleLabel(localeValue: string): string {
  const returnLocale = supportLocale.find((item) => item.value === localeValue)
  return returnLocale ? returnLocale.label : 'English'
}

/**
 * 必要常用時區清單（含會受 DST 影響地區）
 */
const essentialTimezones: TimezoneMeta[] = [
  { value: 'Asia/Taipei', name: 'Taipei' },
  { value: 'Asia/Tokyo', name: 'Tokyo' },
  { value: 'Asia/Singapore', name: 'Singapore' },
  { value: 'Europe/London', name: 'London' },
  { value: 'Europe/Berlin', name: 'Berlin' },
  { value: 'America/New_York', name: 'New York' },
  { value: 'America/Los_Angeles', name: 'Los Angeles' },
  { value: 'Australia/Sydney', name: 'Sydney' }
]

function formatUtcOffset(timezone: string): string {
  const now = DateTime.now().setZone(timezone)
  if (!now.isValid) {
    return '+00:00'
  }
  // Luxon 會依當下日期自動套用 DST，offset 會動態變化
  return now.toFormat('ZZ')
}

function toTimezoneOption(meta: TimezoneMeta): TimezoneOption {
  const offset = formatUtcOffset(meta.value)
  return {
    value: meta.value,
    label: `${meta.name} UTC${offset}`
  }
}

function getShortTimezoneName(timezone: string): string {
  const parts = timezone.split('/')
  const raw = parts[parts.length - 1] || timezone
  return raw.replace(/_/g, ' ')
}

function isValidTimezone(timezone: string): boolean {
  return DateTime.now().setZone(timezone).isValid
}

export function getBrowserTimeZone(): string {
  try {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    return detected && isValidTimezone(detected) ? detected : 'Asia/Taipei'
  } catch {
    return 'Asia/Taipei'
  }
}

export function getTimezoneList(currentTimezone?: string): TimezoneOption[] {
  const browserTimezone = getBrowserTimeZone()
  const browserShortName = getShortTimezoneName(browserTimezone)
  const browserOption: TimezoneOption = {
    value: browserTimezone,
    label: `${browserShortName} UTC${formatUtcOffset(browserTimezone)} (Auto)`
  }
  const base = essentialTimezones.map(toTimezoneOption)
  const selected = currentTimezone?.trim()
  const options: TimezoneOption[] = [browserOption]

  if (!selected || !isValidTimezone(selected)) {
    return [...options, ...base.filter((item) => item.value !== browserTimezone)]
  }

  if (!base.some((item) => item.value === selected) && selected !== browserTimezone) {
    const selectedShortName = getShortTimezoneName(selected)
    options.push({
      value: selected,
      label: `Custom TZ: ${selectedShortName} UTC${formatUtcOffset(selected)}`
    })
  }

  return [...options, ...base.filter((item) => item.value !== browserTimezone)]
}
