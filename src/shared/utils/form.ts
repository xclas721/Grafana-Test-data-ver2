// 表單控制工具

/**
 * 設定欄位為必填
 * @param formConfig 表單配置（ref 或 reactive）
 * @param idsToUpdate 要更新的欄位 ID 陣列
 * @param required 是否必填
 */
export function requiredSet(
  formConfig: { value: Array<{ ID: string; required?: boolean }> },
  idsToUpdate: string[],
  required: boolean
): void {
  for (const field of formConfig.value) {
    if (idsToUpdate.includes(field.ID)) {
      field.required = required
    }
  }
}

/**
 * 設定欄位為唯讀
 * @param formConfig 表單配置（ref 或 reactive）
 * @param idsToUpdate 要更新的欄位 ID 陣列
 * @param readOnly 是否唯讀
 */
export function readOnlySet(
  formConfig: { value: Array<{ ID: string; readOnly?: boolean }> },
  idsToUpdate: string[],
  readOnly: boolean
): void {
  for (const field of formConfig.value) {
    if (idsToUpdate.includes(field.ID)) {
      field.readOnly = readOnly
    }
  }
}

/**
 * 批量設定所有欄位為唯讀（可忽略特定欄位）
 * @param formConfig 表單配置（ref 或 reactive）
 * @param readOnly 是否唯讀
 * @param ignoreArrays 要忽略的欄位 model 名稱陣列
 */
export function readOnlyALLSet(
  formConfig: { value: Array<{ model: string; readOnly?: boolean }> },
  readOnly: boolean,
  ignoreArrays: string[] = []
): void {
  for (const field of formConfig.value) {
    if (!ignoreArrays.includes(field.model)) {
      field.readOnly = readOnly
    }
  }
}

/**
 * 批量隱藏欄位
 * @param formConfig 表單配置（ref 或 reactive）
 * @param hide 是否隱藏
 * @param idsToUpdate 要更新的欄位 model 名稱陣列
 */
export function hideALLSet(
  formConfig: { value: Array<{ model: string; hide?: boolean }> },
  hide: boolean,
  idsToUpdate: string[]
): void {
  for (const field of formConfig.value) {
    if (idsToUpdate.includes(field.model)) {
      field.hide = hide
    }
  }
}
