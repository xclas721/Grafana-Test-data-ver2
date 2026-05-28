/**
 * 選項資料結構定義
 */

/**
 * 基礎選項（文字直接顯示）
 */
export interface BaseSelect {
  value: any
  text: string
}

/**
 * 國際化選項（文字需要 i18n 翻譯）
 */
export interface BaseI18nSelect {
  value: any
  i18nText: string
}

/**
 * 預設選項（請選擇）
 */
export const optionSelect: BaseI18nSelect[] = [
  {
    value: '',
    i18nText: 'ui.option-select'
  }
]
