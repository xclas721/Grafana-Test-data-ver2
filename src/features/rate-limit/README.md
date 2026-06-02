# DDoS AReq 卡號限流測試頁面

## 概述

此頁面將 PowerShell 腳本 `test-ddos-rate-limit-areq-card.ps1` 的功能轉換為 Web 介面，用於測試 DDoS AReq 卡號限流功能。

## 已更新腳本

- `test-ddos-rate-limit-areq-card.ps1`（路徑：`C:\Users\kysonwang\Desktop\工作資料\AReq CReq測試腳本\test-ddos-rate-limit-areq-card.ps1`）
- 其他腳本先不調整：
  - `test-ddos-rate-limit-areq-merchant.ps1`
  - `test-ddos-rate-limit-creq-checkpoint1.ps1`
  - `test-ddos-rate-limit-creq-checkpoint2.ps1`

## 檔案結構

### 新增檔案

1. **`src/views/RateLimitTest.vue`**
   - 主要測試頁面組件
   - 包含配置表單、測試執行邏輯、結果顯示

2. **`src/components/AppLayout.vue`**
   - 通用應用程式佈局組件
   - 包含側邊欄導航，支援多個頁面

### 修改檔案

1. **`src/router/index.ts`**
   - 新增路由 `/rate-limit-test`，對應 `RateLimitTest.vue`

2. **`src/App.vue`**
   - 使用 `AppLayout` 包裹所有路由頁面

3. **`src/views/TestInput.vue`**
   - 調整為使用新的 `AppLayout` 結構

## 功能說明

### 配置參數

對應 PowerShell 腳本的配置區塊（第 10-35 行）：

- **Base URL**: API 基礎 URL（預設: `http://localhost:30100`）
- **Card Scheme**: 卡組織（V, M, J, A, U, C, D, P, N, E, T）
- **Version**: 版本號（預設: `2.2.0`）
- **Fixed Issuer OID**: 固定的發卡機構識別碼（預設: `06b4b203-da05-73f9-256f-454929df6076`）
- **Random Issuer OID Count**: 隨機生成的 issuerOid 數量（預設: `1`）
- **Project ID**: 專案 ID（預設: `001`）
- **Card Prefix**: 卡號前綴（預設: `4143520000000`）
- **Card Count**: 使用幾張卡號（預設: `15`）
- **Requests per Card**: 每張卡號發送幾次請求（預設: `7`）
- **Merchant ID**: 商戶 ID（預設: `8909191`）

### 測試邏輯

對應 PowerShell 腳本的主要迴圈（第 130-248 行）：

1. **外層迴圈**: 遍歷每張卡號
   - 生成卡號：`{cardPrefix}{122 + cardIndex}`
   - 例如：`4143520000000123`, `4143520000000124`, ...

2. **內層迴圈**: 每張卡號發送多個請求
   - 每次請求隨機選擇一個 issuerOid（固定或隨機）
   - 生成新的交易 ID（`dsTransID`, `threeDSServerTransID`）
   - 發送 POST 請求到 `/acs-auth/auth/{cardScheme}/{version}/{issuerOid}/{projectId}/areq`

3. **請求間延遲**:
   - 同卡號請求間：200ms
   - 不同卡號間：500ms

### 結果分類

對應 PowerShell 腳本的統計邏輯（第 117-120, 173-235 行）：

- **成功**: `messageType === "ARes"`
- **限流 (403)**: `errorCode === "403"` 或 HTTP 403
- **Invalid Endpoint (303)**: `errorCode === "303"` 或 HTTP 303
- **其他錯誤**: 其他情況

### 統計顯示

- **總請求數**: `cardCount * requestCount`
- **成功數**: 預期 `cardCount * 5`（每張卡前 5 個請求成功）
- **限流數**: 預期 `cardCount * (requestCount - 5)`（每張卡第 6 個請求開始限流）
- **Invalid Endpoint 數**: issuerOid 驗證失敗的請求數
- **其他錯誤數**: 其他類型的錯誤

## 技術實作細節

### 請求 Body 結構

對應 PowerShell 腳本第 63-109 行的 JSON 結構，包含所有必要的 AReq 欄位。

### 錯誤處理

1. **HTTP 錯誤狀態碼**: 檢查 `response.ok` 和 `response.status`
2. **JSON 解析錯誤**: 使用 try-catch 處理無法解析的回應
3. **網路錯誤**: 捕獲 fetch 異常

### 日誌系統

- 使用 `logs` 陣列儲存所有日誌條目
- 每個日誌包含：時間、類型（success/error/warning/info）、訊息、詳細資訊
- 自動滾動到底部顯示最新日誌

## 使用方式

1. 訪問 `/rate-limit-test` 路由
2. 配置測試參數（或點擊「載入預設值」）
3. 點擊「開始測試」按鈕
4. 觀察即時日誌和統計結果

## 擴展性

此頁面設計為可擴展，未來可以：

1. **新增其他測試類型**:
   - 商戶限流測試（`test-ddos-rate-limit-areq-merchant.ps1`）
   - CReq 檢查點1測試（`test-ddos-rate-limit-creq-checkpoint1.ps1`）
   - CReq 檢查點2測試（`test-ddos-rate-limit-creq-checkpoint2.ps1`）

2. **新增配置選項**:
   - 在配置表單中新增欄位
   - 在測試邏輯中使用新配置

3. **改進 UI**:
   - 新增圖表顯示
   - 匯出測試結果
   - 儲存測試配置

## 注意事項

1. **編碼**: 確保所有文字使用 UTF-8 編碼（PowerShell 腳本中有設定）
2. **時區**: 使用瀏覽器本地時區（`purchaseDate` 使用 `new Date()`）
3. **UUID 生成**: 使用 `crypto.randomUUID()`（對應 PowerShell 的 `[System.Guid]::NewGuid()`）
4. **日期格式**: `purchaseDate` 使用 `yyyyMMddHHmmss` 格式（對應 PowerShell 的 `Get-Date -Format "yyyyMMddHHmmss"`）

## 對應關係

| PowerShell 腳本 | Vue 組件 |
|---------------|---------|
| `Write-Host` | `addLog()` |
| `Invoke-RestMethod` | `fetch()` |
| `Start-Sleep` | `sleep()` (Promise) |
| `[System.Guid]::NewGuid()` | `crypto.randomUUID()` |
| `Get-Date -Format "yyyyMMddHHmmss"` | `new Date().toISOString().replace(...)` |
| `ConvertTo-Json` | `JSON.stringify()` |
| `ConvertFrom-Json` | `JSON.parse()` |

## 未來改進建議

1. 新增測試結果匯出功能（JSON/CSV）
2. 新增測試配置儲存/載入功能
3. 新增測試歷史記錄
4. 新增圖表視覺化（成功率、限流率等）
5. 新增並發控制選項
6. 新增測試進度條
7. 新增測試暫停/繼續功能
