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

const zoneValues = [
  'Pacific/Pago_Pago',
  'Pacific/Honolulu',
  'Pacific/Gambier',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Halifax',
  'America/Sao_Paulo',
  'America/Noronha',
  'Atlantic/Cape_Verde',
  'UTC',
  'Europe/London',
  'Europe/Paris',
  'Europe/Rome',
  'Africa/Johannesburg',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Ho_Chi_Minh',
  'Asia/Phnom_Penh',
  'Asia/Jakarta',
  'Asia/Taipei',
  'Asia/Singapore',
  'Asia/Hong_Kong',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Brisbane',
  'Australia/Sydney',
  'Pacific/Noumea',
  'Pacific/Tarawa',
  'Pacific/Auckland',
  'Pacific/Apia',
  'Pacific/Kiritimati'
] as const

const essentialTimezones: string[] = [...zoneValues]

const formatOffset = (offsetMinutes: number): string => {
  const sign = offsetMinutes >= 0 ? '+' : '-'
  const absMinutes = Math.abs(offsetMinutes)
  const hours = Math.floor(absMinutes / 60)
  const minutes = absMinutes % 60
  return minutes === 0
    ? `UTC${sign}${hours}`
    : `UTC${sign}${hours}:${minutes.toString().padStart(2, '0')}`
}

export function formatTimezoneLabel(value: string): string {
  const offsetMinutes = DateTime.now().setZone(value).offset
  return `${formatOffset(offsetMinutes)} | ${value}`
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
  const list = essentialTimezones.map((item) => ({
    value: item,
    label: formatTimezoneLabel(item)
  }))

  const selected = currentTimezone?.trim()
  if (selected && isValidTimezone(selected) && !list.some((item) => item.value === selected)) {
    list.unshift({ value: selected, label: formatTimezoneLabel(selected) })
  }

  return list
}
