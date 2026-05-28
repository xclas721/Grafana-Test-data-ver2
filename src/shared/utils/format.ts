// 通用格式工具
import { DateTime } from 'luxon'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { BaseSelect, BaseI18nSelect } from '@/shared/utils/select/baseSelect'
import { useAppStore } from '@/stores/app'

/**
 * 空值處理，返回預設值或原值
 * @param val 要處理的值
 * @param defaultValue 預設值，預設為 'N/A'
 * @returns 處理後的值
 */
export function valOrNA(
  val: string | number | boolean | null | undefined,
  defaultValue: string = 'N/A'
): string | number | boolean {
  // 數字 0 和 false 應該被視為有效值
  if (val === 0 || val === false) {
    return val
  }
  return val !== null && val !== undefined && val !== '' ? val : defaultValue
}

/**
 * 日期格式化（支援時區）
 * @param value 日期值（Date、string、number）
 * @param fmt 格式字串，預設 'yyyy-MM-dd HH:mm:ss'
 * @param timeZone 時區，預設使用 App Store 的時區
 * @returns 格式化後的日期字串，無效則返回 null
 */
export const dateFormat = (
  value: unknown,
  fmt: string = 'yyyy-MM-dd HH:mm:ss',
  timeZone?: string
): string | null => {
  if (value == null || value === '') return null

  const appStore = useAppStore()
  const tz = timeZone ?? appStore.timeZone

  // 1. 根據類型創建 DateTime
  let dt: DateTime
  if (typeof value === 'number') {
    // 判斷是秒級還是毫秒級時間戳（大於 10^10 視為毫秒級）
    if (value > 10000000000) {
      dt = DateTime.fromMillis(value, { zone: tz })
    } else {
      dt = DateTime.fromSeconds(value, { zone: tz })
    }
  } else if (value instanceof Date) {
    dt = DateTime.fromJSDate(value, { zone: tz })
  } else if (typeof value === 'string') {
    // 先嘗試 ISO 8601，再退到本地解析
    dt = DateTime.fromISO(value, { zone: tz })
    if (!dt.isValid) {
      // 嘗試解析常見的日期格式
      const cleanedValue = value.replace(/-/g, '/')
      dt = DateTime.fromJSDate(new Date(cleanedValue), { zone: tz })
    }
  } else {
    // 其他類型，嘗試 toString 再解析
    dt = DateTime.fromISO(String(value), { zone: tz })
  }

  // 2. 校驗合法性
  if (!dt.isValid) return null

  // 3. 格式化輸出
  return dt.toFormat(fmt)
}

/**
 * 判斷是否為 BaseI18nSelect
 */
function isBaseI18nSelect(option: BaseI18nSelect | BaseSelect): option is BaseI18nSelect {
  return (option as BaseI18nSelect).i18nText !== undefined
}

/**
 * 從選項陣列中根據值取得對應的文字（支援 i18n）
 * @param val 要查找的值
 * @param options 選項陣列
 * @param defaultValue 找不到時的預設值，預設為 'N/A'
 * @returns 對應的文字，找不到則返回預設值
 */
export function getOptionsByValue(
  val: any,
  options: (BaseSelect | BaseI18nSelect)[] | undefined,
  defaultValue: string = 'N/A'
): string {
  if (options === undefined || options === null || options.length === 0) {
    return defaultValue
  }
  if (val === null || val === undefined || val === '') {
    return defaultValue
  }

  // 使用嚴格相等比較，但允許類型轉換（== 而非 ===）
  const option = options.find((item) => String(item.value) === String(val))
  if (!option) {
    return defaultValue
  }

  try {
    const { t } = useI18n()
    return isBaseI18nSelect(option) ? t(option.i18nText) : option.text || defaultValue
  } catch {
    // 如果 i18n 失敗，返回文字或預設值
    return isBaseI18nSelect(option) ? defaultValue : option.text || defaultValue
  }
}

/**
 * 判斷兩個值是否不同（支援多種類型）
 * @param afterValue 新值
 * @param beforeValue 舊值
 * @returns 是否不同
 */
export const isDifferent = (
  afterValue: string | number | boolean | null | undefined,
  beforeValue: string | number | boolean | null | undefined
): boolean => {
  // 將空字串、null、undefined 統一視為「空值」
  const normalizeEmpty = (
    val: string | number | boolean | null | undefined
  ): string | number | boolean | null => {
    if (val === null || val === undefined || val === '') {
      return null
    }
    return val
  }

  const normalizedAfter = normalizeEmpty(afterValue)
  const normalizedBefore = normalizeEmpty(beforeValue)

  // 兩個都是空值，視為相同
  if (normalizedAfter === null && normalizedBefore === null) {
    return false
  }

  // 一個是空值，一個不是，視為不同
  if (normalizedAfter === null || normalizedBefore === null) {
    return true
  }

  // 類型不同視為不同
  if (typeof normalizedAfter !== typeof normalizedBefore) {
    return true
  }

  // 字串比較（忽略前後空白）
  if (typeof normalizedAfter === 'string' && typeof normalizedBefore === 'string') {
    return normalizedAfter.trim() !== normalizedBefore.trim()
  }

  // 其他類型直接比較
  return normalizedAfter !== normalizedBefore
}

/**
 * 響應式時間計算
 * @returns 開始日期和結束日期的 computed
 */
export const useTimeCalculations = () => {
  const appStore = useAppStore()
  const getStartDate = computed(() => appStore.getStartDate)
  const getEndDate = computed(() =>
    DateTime.now().setZone(appStore.timeZone).toFormat('yyyy-MM-dd HH:mm:ss')
  )

  return { getStartDate, getEndDate }
}

/**
 * 彈窗標題 I18N 轉換
 * @param val 操作類型（ADD、UPDATE、UPLOAD、IMPORT、LOAD）
 * @returns i18n 鍵值
 */
export function conventTitle(val: string): string {
  if (val === 'ADD') return 'btn.new'
  if (val === 'UPDATE') return 'btn.update'
  if (val === 'UPLOAD') return 'btn.upload'
  if (val === 'IMPORT') return 'btn.import'
  if (val === 'LOAD') return 'btn.load'
  return 'btn.detail'
}
