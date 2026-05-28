/**
 * EMV® 3-D Secure Protocol and Core Functions Specification：Erro 訊息中 `errorCode` 值之意義表
 * （各版文件常標為 Table A.4；與 message 結構說明內 Meaning of values 欄一致）。
 *
 * `errorDescription` 欄位使用該表之**英文原文**（逐字）；`errorDetail` 仍為示意，規格未逐碼定死。
 * 若你手邊 PDF 版本用字與此略有差異，以你持有的 EMVCo 正式版次為準。
 *
 * 用於 Grafana-Test-data 產生可出現在「錯誤代碼摘要」儀表板的文件（後端會排除 NULL_VALUE）。
 */
export type EmvThreeDSErrorPreset = {
  id: string
  /** 按鈕顯示 */
  shortLabel: string
  errorCode: string
  errorComponent: string
  errorDescription: string
  errorDetail: string
  errorMessageType: string
}

/** 無錯誤：與正式環境多數成功交易一致，Grafana 錯誤面板會排除 */
export const PRESET_NO_ERROR: EmvThreeDSErrorPreset = {
  id: 'none',
  shortLabel: '無錯誤',
  errorCode: 'NULL_VALUE',
  errorComponent: 'NULL_VALUE',
  errorDescription: 'NULL_VALUE',
  errorDetail: 'NULL_VALUE',
  errorMessageType: 'NULL_VALUE'
}

/**
 * 可一鍵套用的預設（含 101／203 等）。
 * errorMessageType 使用與後端 MessageTypeEnum 相同的字串（如 ARes、MReq）。
 */
export const EMV_THREEDS_ERROR_PRESETS: EmvThreeDSErrorPreset[] = [
  PRESET_NO_ERROR,
  {
    id: '101-S',
    shortLabel: '101',
    errorCode: '101',
    errorComponent: 'S',
    errorDescription: 'Message Received Invalid',
    errorDetail: 'Invalid Formatted Message',
    errorMessageType: 'ARes'
  },
  {
    id: '203-S',
    shortLabel: '203',
    errorCode: '203',
    errorComponent: 'S',
    errorDescription:
      'Format of one or more Data Elements is Invalid according to the Specification',
    errorDetail: 'transStatus',
    errorMessageType: 'ARes'
  },
  {
    id: '301-S',
    shortLabel: '301',
    errorCode: '301',
    errorComponent: 'S',
    errorDescription: 'Transaction ID Not Recognised',
    errorDetail: 'The Transaction ID received was invalid.',
    errorMessageType: 'MReq'
  },
  {
    id: '403-S',
    shortLabel: '403',
    errorCode: '403',
    errorComponent: 'S',
    errorDescription: 'Transient System Failure',
    errorDetail: 'Failed to send AReq to DS, empty response from DS!',
    errorMessageType: 'AReq'
  },
  /** DS 回傳 Erro／驗證失敗時 errorComponent 常為 D（對齊 AReqMessageHandler 由 DS body 帶入） */
  {
    id: '201-D',
    shortLabel: '201·D',
    errorCode: '201',
    errorComponent: 'D',
    errorDescription: 'Required Data Element Missing',
    errorDetail: 'dsServerRefNumber',
    errorMessageType: 'ARes'
  },
  {
    id: '302-D',
    shortLabel: '302·D',
    errorCode: '302',
    errorComponent: 'D',
    errorDescription: 'Data Decryption Failure',
    errorDetail: 'Decryption of request data failed.',
    errorMessageType: 'AReq'
  },
  {
    id: '404-D',
    shortLabel: '404·D',
    errorCode: '404',
    errorComponent: 'D',
    errorDescription: 'Permanent System Failure',
    errorDetail: 'Directory Server unavailable.',
    errorMessageType: 'ARes'
  },
  {
    id: '305-A',
    shortLabel: '305·A',
    errorCode: '305',
    errorComponent: 'A',
    errorDescription: 'Transaction data not valid',
    errorDetail: 'acctNumber',
    errorMessageType: 'AReq'
  }
]

/** 批次隨機混入用：不含「無錯誤」 */
export const BATCH_ERROR_PRESETS: EmvThreeDSErrorPreset[] = EMV_THREEDS_ERROR_PRESETS.filter(
  (p) => p.id !== 'none'
)

/**
 * 依模式抽樣：
 * - 3DSS：索引為 3dss-transaction-*，錯誤摘要依 errorComponent 分 A／D／S，故混入時抽**全集**（含 S、D、A）以便三欄皆有樣本。
 * - ACS：以 A 為主（若無 A 則退回全集）。
 */
export function pickRandomBatchErrorPreset(mode: 'acs' | 'dss'): EmvThreeDSErrorPreset {
  const forAcs = BATCH_ERROR_PRESETS.filter((p) => p.errorComponent === 'A')
  const pool =
    mode === 'dss' ? BATCH_ERROR_PRESETS : forAcs.length > 0 ? forAcs : BATCH_ERROR_PRESETS
  return pool[Math.floor(Math.random() * pool.length)]!
}

/** 將預設寫入 getFormData() 產生的扁平表單（供批次 buildDocument 前覆寫） */
export function applyErrorPresetToFormData(
  data: Record<string, string>,
  preset: EmvThreeDSErrorPreset
): void {
  data.errorCode = preset.errorCode
  data.errorComponent = preset.errorComponent
  data.errorDescription = preset.errorDescription
  data.errorDetail = preset.errorDetail
  data.errorMessageType = preset.errorMessageType
}
