# ACS System Monitor 假資料與後端產生邏輯分析

> 對象：I-05 卡核心錯誤、I-08 RReq 錯誤、I-10 OTP 錯誤  
> 查詢實作：`SystemMonitorReportServiceElasticsearchImpl.queryExternalErrorCountTrend`  
> 更新：2026-07-03

---

## 1. Grafana 查詢條件（後端）

三個 panel 共用 `queryExternalErrorCountTrend`，差別只在 `stateMachineReason` 代碼：

| Panel | 代碼               | 意義                                 |
| ----- | ------------------ | ------------------------------------ |
| I-05  | 3101 / 3102 / 3199 | 卡核心連線失敗 / 讀取超時 / 響應異常 |
| I-08  | 3401 / 3402 / 3499 | RReq 連線失敗 / 讀取超時 / RRes 錯誤 |
| I-10  | 3301 / 3302 / 3399 | OTP 連線失敗 / 讀取超時 / 響應異常   |

**共同篩選（重要）：**

```text
transStatus NOT IN (Y, A, C, D, I)
```

也就是說：就算 ES 裡有 `stateMachineReason=3401`，若 `transStatus` 仍是 `C`（Challenge 進行中）或 `Y`（成功），**I-08 不會計入**。

欄位名稱 `stateMachineReason` 與 `acs-transaction` 索引一致，**不是欄位取錯**。

---

## 2. 三類「沒資料」判斷

| 類別                    | 說明                     | I-08          | I-10          |
| ----------------------- | ------------------------ | ------------- | ------------- |
| **1. 查詢／欄位錯**     | API 或 Grafana 對錯欄位  | ❌ 不適用     | ❌ 不適用     |
| **2. ACS 本來就不產生** | 正常交易流程不會寫入該碼 | ⚠️ 部分       | ⚠️ 部分       |
| **3. 假資料工具不支援** | 未模擬失敗路徑或缺代碼   | ✅ 修正前主因 | ✅ 修正前主因 |

---

## 3. ACS 何時寫入各代碼（類別 2 細項）

### I-08：RReq（3401 / 3402 / 3499）

| 代碼     | 後端觸發點                                                            | 是否合理                                         |
| -------- | --------------------------------------------------------------------- | ------------------------------------------------ |
| **3401** | `RReqMessageHandler`：送 RReq 至 DS 連線失敗（`RestClientException`） | ✅ 合理；僅 Challenge 完成後、ACS 送 RReq 時發生 |
| **3402** | 同上：讀取 RRes 逾時（`SocketTimeoutException`）                      | ✅ 合理；屬少見異常                              |
| **3499** | `RReqMessageHandler`：RRes 內容錯誤                                   | ✅ 合理；屬少見異常                              |

**寫入 ES：** `MetricsDataUtil` 從 `ThreeDSContextDataHolder.getStmReason()` 帶出 `stateMachineReason`（需 `metrics-elasticsearch` profile）。

**為何現網常為空：** 成功交易佔絕大多數；RReq 失敗屬邊角情境。這是預期行為，不是 bug。

### I-10：OTP（3301 / 3302 / 3399）

| 代碼     | 後端觸發點                                                       | 是否合理              |
| -------- | ---------------------------------------------------------------- | --------------------- |
| **3399** | `SendSmsOtpProcessor` / `SendEmailOtpProcessor` 等：OTP 發送失敗 | ✅ **標準產品會寫**   |
| **3301** | enum 有定義，註解 **「需客製化添加」**                           | ⚠️ **標準程式未 set** |
| **3302** | 同上                                                             | ⚠️ **標準程式未 set** |

**結論：** I-10 在現網主要只會看到 **3399**；3301/3302 要客製 OTP 連線層才會出現。Dashboard 預留三線是對齊 enum，不算查詢錯誤。

### 附：I-05 卡核心（3101 / 3102 / 3199）

| 代碼               | 觸發點                                                                |
| ------------------ | --------------------------------------------------------------------- |
| 3101 / 3102 / 3199 | `BaseCardDataService.inquiryCardDataFromEPS` 呼叫發卡行卡資料介面失敗 |

AReq 階段錯誤，`transStatus` 通常為 N/R/U，較容易通過 `mustNot` 篩選。

---

## 4. 假資料工具（類別 3）— 修正前後

### ver2 原先缺口（已於 2026-07-03 補齊）

| 項目                                    | Grafana-Test-data (v1) | Grafana-Test-data-ver2（修正前）                |
| --------------------------------------- | ---------------------- | ----------------------------------------------- |
| ACS `stateMachineReason` 選項           | 完整 enum（~90 碼）    | 僅 6 碼                                         |
| 3301 / 3302 / 3399                      | 可手選                 | ❌ 無                                           |
| 3499                                    | 可手選                 | ❌ 無                                           |
| 3101 / 3102 / 3199                      | 可手選                 | ❌ 無                                           |
| ACS 隨機加權（System Monitor）          | ❌ 無（均勻抽樣）      | ❌ 無                                           |
| `transStatus` 與錯誤碼對齊              | ❌ 無                  | ❌ 無                                           |
| `alignTransactionReasonsWithBackend.ts` | ✅ 有                  | ❌ 無（與 EMV Error 批次相關，非本 panel 專用） |

### 本次兩專案同步變更

1. **ver2** 還原與 v1 相同的完整 `stateMachineReason.ts`（ACS / 3DSS enum）。
2. 新增：
   - `pickRandomStateMachineReasonAcsWeighted()` — 約 12.5% 機率抽到 System Monitor 九碼之一。
   - `alignStatusesForSystemMonitorError()` — 自動設 `transStatus=N`，RReq/OTP 錯誤設 `ares=C`、`rreq=N`。
3. `rollRandomStatuses` / `resolveStatusDependencies` / 表單 sync 已套用上述邏輯。

### 手動驗證一筆（I-08）

```text
stateMachineReason: 3401
ares_transStatus: C
rreq_transStatus: N
transStatus: N
```

### 手動驗證一筆（I-10）

```text
stateMachineReason: 3399
ares_transStatus: C
rreq_transStatus: N
transStatus: N
performance_metrics 含 VerificationCodeService.sendVerificationCode（Challenge 流程）
```

---

## 5. 合理性總評

| 問題                              | 結論                                                          |
| --------------------------------- | ------------------------------------------------------------- |
| Dashboard 查詢設計是否合理？      | ✅ 合理。只統計**失敗交易**上的外部介面錯誤，避免成功單稀釋。 |
| 現網 I-08 常空白？                | ✅ 合理。RReq 失敗少。                                        |
| 現網 I-10 只有 3399 有線？        | ✅ 合理。3301/3302 需客製。                                   |
| 假資料批量後 I-08/I-10 應有曲線？ | ✅ 修正後應可；建議時間範圍涵蓋插入日、Issuer 一致。          |

---

## 6. 兩專案仍待對齊項目（非本次範圍）

- `alignTransactionReasonsWithBackend.ts` 僅 v1 有（EMV Error 批次與 3DSS 對齊）。
- 專案結構不同（v1 單體 Vue / v2 features + server），其餘邏輯應透過共用 `stateMachineReason.ts` 與 `useTransactionStatusRules.ts` 保持同步。
