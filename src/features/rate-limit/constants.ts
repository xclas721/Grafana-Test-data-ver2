/**
 * DDoS 限流測試 - 統一用語
 */
export const LABELS = {
  cardScheme: '卡組織',
  version: '版本',
  issuerOid: 'Issuer OID',
  projectId: '專案 ID',
  merchantId: '商戶 ID',
  merchantName: '商戶名稱',
  mcc: '商店類別碼 (MCC)',
  merchantCountryCode: '商戶國別碼',
  acquirerBin: '收單行 BIN',
  purchaseAmount: '交易金額',
  purchaseCurrency: '交易幣別',
  purchaseExponent: '交易幣別小數位',
  cardPrefix: '卡號前綴',
  cardCount: '卡號數量',
  requestsPerCard: '每張卡請求次數',
  requestCount: '請求次數',
  cardPoolSize: '卡號池大小',
  acctNumber: '卡號 (AReq 用)',
  threeDSServerTransID: '3DS Server 交易 ID',
  threeDSMethodNotificationURL: '3DS Method 通知 URL'
} as const

export const SECTION_TITLES = {
  connection: '連線設定',
  merchant: '商戶設定',
  transaction: '交易設定',
  cardAndRequest: '卡號與請求設定',
  request: '請求設定',
  merchantForAreq: '商戶設定 (AReq 初始請求用)'
} as const

export const BUTTONS = {
  loadDefaults: '載入預設值',
  startTest: '開始測試',
  stopTest: '停止測試'
} as const

export const CARD_TITLES = {
  config: '測試配置',
  summary: '測試結果摘要',
  log: '測試日誌',
  logSubtitle: '即時顯示測試過程'
} as const

export const STAT_LABELS = {
  pass: '通過',
  blocked: '限流',
  error: '錯誤'
} as const

export const PLACEHOLDER = {
  noTestYet: '尚未開始測試'
} as const

/** 測試前準備：所有測試共用 */
export const PREREQUISITES = {
  title: '測試前準備',
  items: [
    '請確保 acs-auth (port 30100)、acs-auth-web (port 8050) 服務已啟動',
    '開發環境：頂欄留空時，由 Vite proxy 轉發至 localhost',
    '部署環境：請在頂欄「API 網域」設定完整 URL，或透過 nginx 反向代理'
  ]
} as const

/** 操作步驟：所有測試共用 */
export const OPERATION_STEPS = [
  '確認頂欄 API 網域已設定（或留空使用 proxy）',
  '點擊「載入預設值」或依需求調整參數',
  '點擊「開始測試」執行',
  '觀察測試日誌與結果摘要，必要時可「停止測試」'
] as const

/** 各測試的說明（用途、原理、預期結果） */
export const TEST_DESCRIPTIONS = {
  areqCard: {
    title: 'AReq 卡號限流測試',
    purpose: '驗證 AReq 端點以 acctNumber（卡號）為主的 DDoS 限流機制。',
    principle:
      '以 acctNumber 為 key，採用 Token Bucket 演算法，每個卡號獨立 bucket、容量 5 tokens、每分鐘補充 5。同一卡號連續請求時，前 5 次通過，第 6 次起應被阻擋。',
    config: 'bucket.acc.number.capacity = 5',
    checkOrder: '檢查順序：DDoS 檢查時先檢查卡號，再檢查商戶。',
    expected: '預期：每張卡前 5 次 PASS，第 6 次起 BLOCKED。'
  },
  areqMerchant: {
    title: 'AReq 商戶限流測試',
    purpose: '驗證 AReq 端點以 acquirerMerchantID（商戶 ID）為主的 DDoS 限流機制。',
    principle:
      '以 acquirerMerchantID 為 key，採用 Token Bucket 演算法，每個商戶獨立 bucket、容量 360 tokens、每分鐘補充 360。同一商戶連續請求時，前 360 次通過，第 361 次起應被阻擋。',
    config: 'bucket.merchant.capacity = 360',
    checkOrder: '檢查順序：僅在卡號未觸發限流時，才會檢查商戶限流。',
    expected: '預期：前 360 次 PASS，第 361 次起 BLOCKED。'
  },
  creqCheckpoint1: {
    title: 'CReq 檢查點1',
    purpose: '驗證 CReq 第一階段（Checkpoint1）「快速阻擋已知攻擊」的機制。',
    principle:
      'isExistForCache(acsTransID) 檢查 bucketsNotExist 或 buckets：若 acsTransID 已存在於 cache（曾被判為攻擊或已限流），直接回傳 true 並限流。一旦進入 blocked 狀態，後續請求仍持續 blocked（因 ID 已 cache）。',
    focus: '重點：觀察「進入 blocked 後，後續請求仍持續 blocked」的行為。',
    expected: '預期：一旦被限流，後續請求應持續 BLOCKED。'
  },
  creqCheckpoint2: {
    title: 'CReq 檢查點2',
    purpose: '驗證 CReq 第二階段（Checkpoint2）「動態限流新攻擊」的機制。',
    principle:
      'setBucketAndConsume(acsTransID) 依 DB 筆數決定 behavior：前 3 筆 CReq 只累計 DB、不限流、不建 bucket；第 4 筆起建立 bucket（5 tokens/分鐘），開始 Token Bucket consume；同一分鐘內超過 5 次時，後續請求被限流。',
    config: 'bucket.capacity = 5',
    focus: '重點：觀察「由 PASS 轉為 BLOCKED」的過渡行為。',
    expected: '預期：前幾次 PASS，之後隨請求數增加漸轉為 BLOCKED。'
  },
  threeDSMethod: {
    title: '3DS Method 限流測試',
    purpose: '驗證 3DS Method 端點 /3dsmethod/{issuerOid}/collect 的 DDoS 限流機制。',
    principle:
      '以 threeDSServerTransID 為 key，採用 Token Bucket 演算法，每個 ID 獨立 bucket、容量 5 tokens（依 duration 補充）。同一 ID 連續請求時，前 5 次通過，第 6 次起應被阻擋。',
    config: 'acs.threeds.method.limit.strategy.capacity = 5',
    expected: '預期：前 5 次 PASS，第 6 次起 BLOCKED。'
  }
} as const
