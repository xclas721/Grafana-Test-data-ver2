/**
 * 狀態機原因代碼（與後端 enum 對齊）
 * - ACS: threeds-acs-v3 StateMachineReasonEnum（純數字字串）
 * - 3DSS: threeds-server-v3 StateMachineReasonEnum（S 前綴）
 */
import type { SelectOption } from '@/shared/components/form/Select.vue'

/** ACS Metrics / transform 用：完整選項（對齊 ACS StateMachineReasonEnum） */
export const STATE_MACHINE_REASON_OPTIONS_ACS: SelectOption[] = [
  { value: '0000', label: '0000 - 驗證成功' },
  { value: '0001', label: '0001 - 挑戰驗證成功' },
  { value: '0002', label: '0002 - 報文已受理' },
  { value: '1001', label: '1001 - 設備裝置不支援' },
  { value: '1002', label: '1002 - 不支援該卡別' },
  { value: '1003', label: '1003 - 交易逾時' },
  { value: '1004', label: '1004 - 交易逾時(首CReq未收到)' },
  { value: '1005', label: '1005 - 交易逾時(非首CReq未收到)' },
  { value: '2001', label: '2001 - 請求訊息錯誤(AReq)' },
  { value: '2002', label: '2002 - 請求訊息錯誤 CReq' },
  { value: '2003', label: '2003 - 不在BIN範圍內' },
  { value: '2004', label: '2004 - 請求端點錯誤 issuerOid' },
  { value: '2005', label: '2005 - 幣別代碼錯誤' },
  { value: '2006', label: '2006 - 幣別小數位錯誤' },
  { value: '2007', label: '2007 - 國別代碼錯誤' },
  { value: '2101', label: '2101 - 卡號錯誤' },
  { value: '2102', label: '2102 - 卡號有效期錯誤' },
  { value: '2103', label: '2103 - 卡號已鎖卡' },
  { value: '2104', label: '2104 - 卡號未開通 3DS' },
  { value: '2105', label: '2105 - 卡號異常' },
  { value: '2106', label: '2106 - 卡號有效期已過期' },
  { value: '2107', label: '2107 - 證件號碼錯誤' },
  { value: '2108', label: '2108 - 持卡人鎖卡' },
  { value: '2109', label: '2109 - 持卡人未開通 3DS' },
  { value: '2110', label: '2110 - 持卡人異常' },
  { value: '2201', label: '2201 - 指定的 3RI 場景不支援 PA 交易' },
  { value: '2202', label: '2202 - 指定的 3RI 場景不支援 NPA 交易' },
  { value: '2203', label: '2203 - 3RI 後續交易-查無原始交易' },
  { value: '2204', label: '2204 - 3RI 後續交易-原始交易驗證未成功' },
  { value: '2205', label: '2205 - 3RI 後續交易-已超過期限' },
  { value: '2206', label: '2206 - 3RI 後續交易-交易幣別不同' },
  { value: '2207', label: '2207 - 3RI 後續交易-交易金額超過原始金額' },
  { value: '2208', label: '2208 - 3RI 後續交易-卡號不同' },
  { value: '2209', label: '2209 - 3RI 後續交易-超過分期次數限制' },
  { value: '2210', label: '2210 - 3RI 後續交易-循環效期錯誤' },
  { value: '2211', label: '2211 - 3RI Agent Payment-後續金額總額超過首筆金額' },
  { value: '3101', label: '3101 - 卡核心系統連線失敗' },
  { value: '3102', label: '3102 - 卡核心系統讀取超時' },
  { value: '3199', label: '3199 - 卡核心系統響應異常' },
  { value: '3201', label: '3201 - 加密機接口連線失敗' },
  { value: '3202', label: '3202 - 加密機接口讀取超時' },
  { value: '3299', label: '3299 - 加密機接口響應異常' },
  { value: '3301', label: '3301 - OTP 系統連線失敗' },
  { value: '3302', label: '3302 - OTP 系統讀取超時' },
  { value: '3399', label: '3399 - OTP 系統響應異常' },
  { value: '3401', label: '3401 - RReq 連線失敗' },
  { value: '3402', label: '3402 - RReq 讀取超時' },
  { value: '3403', label: '3403 - RRes 校驗失敗' },
  { value: '3499', label: '3499 - RRes 返回錯誤' },
  { value: '3501', label: '3501 - OOB 接口連線超時' },
  { value: '3502', label: '3502 - OOB 接口讀取超時' },
  { value: '3599', label: '3599 - OOB 接口響應異常' },
  { value: '3601', label: '3601 - 離線驗證系統連線超時' },
  { value: '3602', label: '3602 - 離線驗證系統讀取超時' },
  { value: '3699', label: '3699 - 離線驗證系統響應異常' },
  { value: '4001', label: '4001 - 高風險' },
  { value: '4002', label: '4002 - 3RI 場景無法執行挑戰驗證' },
  { value: '4101', label: '4101 - 黑名單-IP' },
  { value: '4102', label: '4102 - 黑名單-Email' },
  { value: '4103', label: '4103 - 黑名單-商店代號' },
  { value: '4104', label: '4104 - 黑名單-設備識別碼' },
  { value: '4105', label: '4105 - 黑名單-卡號' },
  { value: '4106', label: '4106 - 黑名單-證件號碼' },
  { value: '4107', label: '4107 - 黑名單-電話號碼' },
  { value: '4108', label: '4108 - 黑名單-來源國別' },
  { value: '4109', label: '4109 - 黑名單-商店網址' },
  { value: '4110', label: '4110 - 黑名單-商店國別' },
  { value: '5001', label: '5001 - 等待持卡人選擇驗證方式' },
  { value: '5002', label: '5002 - 持卡人取消' },
  { value: '5003', label: '5003 - 超過驗證次數限制' },
  { value: '5004', label: '5004 - 尚未收到 CReq' },
  { value: '5101', label: '5101 - 已發送 OTP' },
  { value: '5102', label: '5102 - 已重送 OTP' },
  { value: '5103', label: '5103 - 請求重送超過次數限制' },
  { value: '5104', label: '5104 - 請求重送時間間隔過短' },
  { value: '5105', label: '5105 - 驗證碼錯誤' },
  { value: '5106', label: '5106 - 驗證碼已過期' },
  { value: '5107', label: '5107 - 驗證碼已使用' },
  { value: '5201', label: '5201 - OOB 初始化' },
  { value: '5202', label: '5202 - OOB 驗證失敗' },
  { value: '5301', label: '5301 - KBA 答覆錯誤' },
  { value: '5302', label: '5302 - 無法取得 KBA 題目' },
  { value: '5303', label: '5303 - 已完成 OTP，進入第二階段 KBA 提問' },
  { value: '5401', label: '5401 - FIDO 註冊' },
  { value: '5402', label: '5402 - FIDO 驗證失敗，返回驗證方式選擇' },
  { value: '5501', label: '5501 - 尚未收到離線驗證結果' },
  { value: '5502', label: '5502 - 離線驗證失敗' },
  { value: '9999', label: '9999 - 系統錯誤' },
  { value: '9001', label: '9001 - 收到 Error' },
  { value: '9002', label: '9002 - 偵測到 DDOS 攻擊' }
]

/** 3DSS：對齊 threeds-server-v3 StateMachineReasonEnum（S 前綴） */
export const STATE_MACHINE_REASON_OPTIONS_DSS: SelectOption[] = [
  { value: 'S1002', label: 'S1002 - 不支援該卡別' },
  { value: 'S3401', label: 'S3401 - AReq 連線失敗' },
  { value: 'S3402', label: 'S3402 - AReq 讀取超時' },
  { value: 'S3403', label: 'S3403 - ARes 校驗失敗' },
  { value: 'S3499', label: 'S3499 - ARes 返回錯誤' },
  { value: 'S9999', label: 'S9999 - 系統錯誤' }
]

export const STATE_MACHINE_REASON_VALUES_ACS: string[] = STATE_MACHINE_REASON_OPTIONS_ACS.map((o) =>
  String(o.value)
)

export const STATE_MACHINE_REASON_VALUES_DSS: string[] = STATE_MACHINE_REASON_OPTIONS_DSS.map((o) =>
  String(o.value)
)

export type ProductMode = 'acs' | 'dss'

export function getStateMachineReasonOptions(mode: ProductMode | undefined): SelectOption[] {
  if (mode === 'dss') return STATE_MACHINE_REASON_OPTIONS_DSS
  return STATE_MACHINE_REASON_OPTIONS_ACS
}

/** 固定模式下輸入為空時的預設 */
export function defaultStateMachineReason(mode: ProductMode | undefined): string {
  if (mode === 'dss') return 'NULL_VALUE'
  return '0000'
}

/** 隨機池（全隨機時從此集合抽樣） */
export function getStateMachineReasonValuesForRandom(mode: ProductMode | undefined): string[] {
  if (mode === 'dss') return [...STATE_MACHINE_REASON_VALUES_DSS]
  return [...STATE_MACHINE_REASON_VALUES_ACS]
}

/** 切換到 3DSS 時：若仍是 ACS 四位數代碼，改為可辨識的 3DSS 預設 */
export function normalizeStateMachineReasonForDss(current: string): string {
  const t = String(current || '').trim()
  if (/^[0-9]{4}$/.test(t)) return 'NULL_VALUE'
  return t
}

/**
 * ARes 強制路徑（與 syncStatusDependencies / 隨機產生對齊）
 * - ACS：0000 無摩擦成功、0001 挑戰成功、0002 報文已受理
 * - 3DSS：後端 enum 僅有錯誤碼，此處為測試資料佔位（無完全對應成功碼）
 */
export function stateMachineReasonForAresForcedPath(
  mode: ProductMode | undefined,
  path: 'y' | 'rreqY' | 'rreqNull'
): string {
  if (mode !== 'dss') {
    if (path === 'y') return '0000'
    if (path === 'rreqY') return '0001'
    return '0002'
  }
  // 3DSS：成功路徑 `ThreeDSContextDataHolder` 通常不 setStmReason，寫入交易/ES 為空（此處用 NULL_VALUE → buildDocument 省略）
  return 'NULL_VALUE'
}

/**
 * 隨機池排除（僅用於「非強制」分支抽樣）
 * - ACS：排除 0000/0001/0002（與 ARes 強制路徑對齊）
 * - 3DSS：只排除 S9999（與 ARes=Y 強制路徑對齊）。
 *   若連 S3401/S3402 一併排除，則 S3402（讀取超時）不會從隨機出現；且 rreqWeightNull=0 時強制路徑也不會給 S3402，
 *   儀表板會出現大量連線類、0 筆讀取超時的假資料。
 */
export function reservedStateMachineReasonsForFilter(mode: ProductMode | undefined): string[] {
  if (mode === 'dss') return ['S9999']
  return ['0000', '0001', '0002']
}

/**
 * 3DSS：`stateMachineReason` 來自對 DS 的 AReq（見 threeds-server `AReqMessageHandler`：RestClient 例外先 S3401，根因 SocketTimeout 或重試用盡再 S3402）。
 * 與 ACS 的 ARes/RReq 旗標無一一對應；隨機時應獨立抽樣。
 *
 * `NULL_VALUE` 代表多數成功路徑未寫入 stm（寫入 ES 時應省略欄位，見 buildDocument）。
 * 以下權重為近似教學用，可依現網 ES 比例調整。
 */
export function pickRandomStateMachineReasonDssWeighted(): string {
  const r = Math.random() * 100
  // 近似現網：絕大多數成功交易不帶 stateMachineReason
  if (r < 90) return 'NULL_VALUE'
  if (r < 94) return 'S3401'
  if (r < 96) return 'S3402'
  if (r < 97) return 'S1002'
  if (r < 98) return 'S3403'
  if (r < 99) return 'S3499'
  return 'S9999'
}

/** System Monitor 外部介面錯誤（I-05 卡核心 / I-08 RReq / I-10 OTP） */
export const SYSTEM_MONITOR_EXTERNAL_ERROR_CODES = [
  '3101',
  '3102',
  '3199',
  '3301',
  '3302',
  '3399',
  '3401',
  '3402',
  '3499'
] as const

export type SystemMonitorExternalErrorCode = (typeof SYSTEM_MONITOR_EXTERNAL_ERROR_CODES)[number]

export function isSystemMonitorExternalErrorCode(code: string): boolean {
  return (SYSTEM_MONITOR_EXTERNAL_ERROR_CODES as readonly string[]).includes(code)
}

export type TransactionStatuses = {
  aresTransStatus: string
  rreqTransStatus: string
  transStatus: string
}

/**
 * 對齊 System Monitor 錯誤時序查詢條件：
 * `queryExternalErrorCountTrend` 排除 transStatus ∈ {Y,A,C,D,I}。
 */
export function alignStatusesForSystemMonitorError(
  reason: string,
  statuses: TransactionStatuses
): TransactionStatuses {
  if (!isSystemMonitorExternalErrorCode(reason)) return statuses

  if (reason.startsWith('33') || reason.startsWith('34')) {
    return {
      aresTransStatus: 'C',
      rreqTransStatus: 'N',
      transStatus: 'N'
    }
  }

  return {
    aresTransStatus: 'N',
    rreqTransStatus: 'NULL_VALUE',
    transStatus: 'N'
  }
}

function pickUniformAcsErrorExcludingReservedAndSystemMonitor(): string {
  const reserved = reservedStateMachineReasonsForFilter('acs')
  const candidates = getStateMachineReasonValuesForRandom('acs').filter(
    (reason) =>
      !reserved.includes(reason) &&
      !(SYSTEM_MONITOR_EXTERNAL_ERROR_CODES as readonly string[]).includes(reason)
  )
  if (candidates.length === 0) return '9999'
  return candidates[Math.floor(Math.random() * candidates.length)] as string
}

/**
 * ACS 隨機 stateMachineReason（非 ARes 強制成功路徑）。
 * 提高 I-05 / I-08 / I-10 對應代碼出現率。
 */
export function pickRandomStateMachineReasonAcsWeighted(): string {
  const r = Math.random() * 100
  if (r < 1.5) return '3101'
  if (r < 3) return '3102'
  if (r < 4.2) return '3199'
  if (r < 5.7) return '3401'
  if (r < 7.2) return '3402'
  if (r < 8.4) return '3499'
  if (r < 9.6) return '3301'
  if (r < 10.8) return '3302'
  if (r < 12.5) return '3399'
  return pickUniformAcsErrorExcludingReservedAndSystemMonitor()
}
