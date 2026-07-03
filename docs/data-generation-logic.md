# Grafana Test Data — 假資料產生邏輯說明

> 本文件說明 `Grafana-Test-data-ver2` 產生 Elasticsearch 假資料的完整邏輯，
> 並逐項對照 EMV® 3-D Secure Protocol and Core Functions Specification v2.3.1.1 驗證正確性。

---

## 一、整體流程

```
useTestDataForm.generateRandomFields()
    │
    ├─ randomizeTimingAndGeoFields()   → 幣別、國家、執行時間
    ├─ rollRandomStatuses()            → ares_transStatus / rreq_transStatus / transStatus
    ├─ randomizeBusinessFields()       → 卡號、卡組織、Score、challengeCancel
    ├─ randomizeThreeDSDeviceFields()  → 裝置、IP、locale、messageCategory
    └─ syncStatusDependencies()        → 依賴欄位聯動修正

buildTestDataDocument()
    │
    ├─ 組裝固定欄位（timestamp、金額、cardScheme…）
    ├─ 組裝 performance_metrics
    ├─ 組裝 visaScoreMessageExtension / mastercardMessageExtension
    ├─ 寫入 riskAssesmentResult
    └─ attachGeoIpToDocument()         → browserGeoIP / deviceGeoIP

fetchElasticsearchBulk()               → POST /_bulk 送進 ES
```

---

## 二、各欄位產生邏輯

### 2.1 交易狀態（Transaction Status）

#### 來源：`useTransactionStatusRules.ts` → `rollRandomStatuses()`

| ES 欄位            | 產生邏輯                                                                                                                   | EMV spec 對照                                |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `ares_transStatus` | 依 9 個 weight 加權隨機抽取（Y/N/R/C/D/A/I/S/U）                                                                           | ARes.transStatus，ACS 對 AReq 的回應狀態     |
| `rreq_transStatus` | 僅 `ares_transStatus = C 或 D` 時才抽取（Y/N/NULL_VALUE）                                                                  | RReq.transStatus，Challenge 最終結果         |
| `transStatus`      | `ares_transStatus ∉ {C, D}` → 等於 `ares_transStatus`；否則等於 `rreq_transStatus`（NULL_VALUE 時仍用 `ares_transStatus`） | 最終交易狀態，Grafana 面板「成功率」用此欄位 |

**預設 weight（可調整）：**

| 值  | 預設 weight | 語意           |
| --- | ----------- | -------------- |
| Y   | 6%          | 免密認證成功   |
| N   | 4%          | 認證失敗       |
| R   | 3%          | 拒絕交易       |
| C   | 84%         | 需要挑戰       |
| D   | 0%          | Decoupled 挑戰 |
| A   | 0%          | Attempt        |
| I   | 1%          | 僅資訊         |
| S   | 0%          | SPC            |
| U   | 2%          | 無法認證       |

**✅ EMV 正確性**：transStatus 的推導邏輯（C/D → 等 RReq；其他 → 直接用 ARes）與 spec Ch.3 Frictionless / Challenge flow 一致。

---

### 2.2 狀態機原因（stateMachineReason）

#### 來源：`rollRandomStatuses()` + `resolveStatusDependencies()`

| `ares_transStatus` | `rreq_transStatus` | `stateMachineReason`                     |
| ------------------ | ------------------ | ---------------------------------------- |
| Y                  | —                  | ACS 固定免密路徑代碼                     |
| C / D              | Y                  | 挑戰成功路徑代碼                         |
| C / D              | NULL_VALUE         | 挑戰放棄路徑代碼                         |
| C / D              | N                  | ACS 加權隨機（含 System Monitor 錯誤碼） |
| 其他               | —                  | ACS 加權隨機（含 System Monitor 錯誤碼） |

**System Monitor（I-05 / I-08 / I-10）**：隨機或手動選 `3101–3199`、`3301–3399`、`3401–3499` 時，會呼叫 `alignStatusesForSystemMonitorError()`，將 `transStatus` 設為 `N`（排除 Grafana 查詢的 `mustNot transStatus∈{Y,A,C,D,I}`），並對 RReq/OTP 錯誤補上 `ares=C`、`rreq=N`。

詳見 [acs-system-monitor-fake-data-analysis.md](./acs-system-monitor-fake-data-analysis.md)。

---

### 2.3 交易狀態原因（transStatusReason）

#### 來源：`randomizeBusinessFields()`

- 僅 `ares_transStatus = R` 時才寫入，從候選代碼列表依 cardScheme 隨機抽取
- 其他狀態一律 `NULL_VALUE`

**候選代碼：**

- 共用：`01–26`
- Visa（V）：額外加 `80–92`
- Mastercard（M）：額外加 `80–84、87–88、98`
- Amex（A）：額外加 `80–82`

**✅ EMV 正確性**：spec AnnexA 定義 `transStatusReason` 在 `transStatus = N 或 R` 時有意義。假資料在 N 和 R 時皆寫入，與 spec 一致。

---

### 2.4 挑戰取消（challengeCancel）

#### 來源：`randomizeBusinessFields()`

- 條件：`ares_transStatus = C` 且 `rreq_transStatus = N`
- 依 `challengeCancelRate`（預設 8%）機率寫入候選值之一：`01–07、09、10`
- 其他情況一律 `undefined`（不寫入 ES）

**✅ EMV 正確性**：spec 定義 challengeCancel 代碼含意如下：

| 值  | 意義                          |
| --- | ----------------------------- |
| 01  | 持卡人取消                    |
| 02  | 3DS Requestor 取消            |
| 03  | 交易放棄（Decoupled timeout） |
| 04  | ACS 其他超時                  |
| 05  | ACS 未收到首筆 CReq 超時      |
| 06  | 交易錯誤                      |
| 07  | 未知                          |
| 09  | CRes 回應錯誤                 |
| 10  | CReq 回應錯誤                 |

條件邏輯正確：challengeCancel 只在 Challenge 失敗（C→N）情境才有意義。

---

### 2.5 卡組織 Score 擴充欄位

#### Visa：`visaScoreMessageExtension`

| 條件                           | 內容                                         |
| ------------------------------ | -------------------------------------------- |
| `enableVisaScoreRandom = true` | `{ visaRiskBasedAuthenticationScore: 0–99 }` |
| 否                             | `null`                                       |

- 啟用時 `cardScheme` 強制 = `V`
- Score 範圍 0–99（integer）

**✅ EMV 正確性**：Visa Risk Based Authentication Score Extension 規格中分數為整數，範圍 0–99，欄位名稱 `visaRiskBasedAuthenticationScore`，與假資料一致。

#### Mastercard：`mastercardMessageExtension`

| 條件                               | 內容                                                    |
| ---------------------------------- | ------------------------------------------------------- |
| `enableMastercardExtension = true` | `{ score, reasonCode1, reasonCode2, decision, status }` |
| 否                                 | `null`                                                  |

- 啟用時 `cardScheme` 強制 = `M`
- `score`：0–650（integer，隨機）
- `decision`：`'Not Low Risk'` 或 `'Low Risk'`（隨機）
- `reasonCode1`：預設 `'A'`
- `status`：預設 `'success'`

**⚠️ 注意**：`mastercardMessageExtension` 若傳入 JSON 字串（以 `{` 開頭），會直接 parse 後使用，允許手動覆寫。

---

### 2.6 riskAssesmentResult

#### 來源：`buildTestDataDocument.ts`

```ts
if ((hasVisaScore || hasMastercardScore) && form.aresTransStatus !== 'S') {
  doc.riskAssesmentResult = form.aresTransStatus
}
```

| 條件                                                 | 值                               |
| ---------------------------------------------------- | -------------------------------- |
| 有 Visa Score 或 MC Score，且 `ares_transStatus ≠ S` | `= ares_transStatus`（評估快照） |
| 無 Score，或 `ares_transStatus = S`                  | 不寫入                           |

**語意說明**：對應 ACS 的 `riskAssesmentResult` DB 欄位，寫入時機是 RBA 評估完成後（`assessment.getTransStatus()`），之後不再更新。`transStatus` 可能因挑戰結果而改變，但 `riskAssesmentResult` 不變。

**✅ EMV 正確性**：

| 情境                 | `riskAssesmentResult` | `transStatus` | 正確性              |
| -------------------- | --------------------- | ------------- | ------------------- |
| RBA → Y（免密）      | Y                     | Y             | ✅                  |
| RBA → C，挑戰成功    | C                     | Y             | ✅（快照保留 C）    |
| RBA → C，挑戰失敗    | C                     | N             | ✅                  |
| RBA → R（拒絕）      | R                     | R             | ✅                  |
| SPC（ares=S）+ Score | 不寫入                | S             | ✅（S 非 RBA 輸出） |

---

### 2.7 執行時間（performance_metrics）

#### 來源：`buildTestDataDocument.ts` + `useTimingAndGeoRandomizer.ts`

| path                                           | 範圍         | 說明                                  |
| ---------------------------------------------- | ------------ | ------------------------------------- |
| `/acs-auth/auth/.../areq`                      | 1000–5700 ms | AReq 處理總時間                       |
| `/challenge/brw/.../creq`                      | 300–800 ms   | CReq 處理時間                         |
| `/acs-auth/auth/.../rreq`                      | 200–600 ms   | RReq 處理時間                         |
| `RiskEvaluationService.evaluate`               | 50–200 ms    | RBA 評估時間（所有交易）              |
| `CardSchemeService.caculateCavv`               | 10–30 ms     | CAVV 計算時間（所有交易）             |
| `VerificationCodeService.sendVerificationCode` | 20–80 ms     | OTP 發送時間（**僅 Challenge 流程**） |
| `/challenge/brw/.../creq`                      | 300–800 ms   | CReq 處理時間（**僅 C/D**）           |
| `/acs-auth/auth/.../rreq`                      | 200–600 ms   | RReq 處理時間（**僅 C/D**）           |

**✅ EMV 正確性**：Frictionless（Y/A/I/N/R/U）路徑不含 CReq、RReq、OTP metrics，符合 spec 的 Frictionless Flow 無 Challenge 步驟定義。

---

### 2.8 裝置與網路欄位

#### 來源：`useTestDataRandomizer.ts`

| 欄位                            | 範圍                                               |
| ------------------------------- | -------------------------------------------------- |
| `deviceChannel`                 | `02`（Browser）或 `03`（3RI）                      |
| `messageCategory`               | `01`（PA）、`02`（NPA）、`80`、`85`、`86`          |
| `devicePlatform`                | MacIntel / Win32 / Linux x86_64 / iPhone / Android |
| `deviceLocale`                  | zh-TW / zh-CN / en-US / en-GB / ja-JP / ko-KR      |
| `deviceIpAddress` / `browserIP` | 隨機 IPv4 或 IPv6                                  |
| `deviceAdvertisingId`           | 32 位隨機 hex                                      |
| `threeDSCompInd`                | Y 或 N（各 50%）                                   |
| `authenticationMethod`          | 01–05                                              |
| `authenticationType`            | 01–05                                              |
| `threeDSRequestorChallengeInd`  | 01–10                                              |

**⚠️ 注意**：`80`/`85`/`86` 為 HiTRUST 私有擴充值，非 EMV spec 標準定義（`01`=PA、`02`=NPA）。為覆蓋系統實際存在的私有 messageCategory 場景，刻意保留。

---

### 2.9 地理位置（GeoIP）

#### 來源：`geoIpDocument.ts` → `attachGeoIpToDocument()`

- `browserGeoIP` 和 `deviceGeoIP` 均從 `merchantCountryCode` 對應城市列表隨機抽取
- 支援 12 個國家（CN/TW/US/JP/HK/KR/SG/KH/AU/CA/EU/GB）
- 座標加入 ±0.05 範圍的隨機偏移

---

### 2.10 批次錯誤混入（Batch Error Mix）

#### 來源：`emvThreeDSErrorPresets.ts`

- 預設 15% 的交易會被覆寫為錯誤訊息
- ACS 模式：優先選 `errorComponent = A` 的預設（acctNumber 無效等）
- 3DSS 模式：從全集（A/D/S）隨機抽

**預設錯誤代碼對照 EMV spec：**

| errorCode | errorComponent | errorDescription                               | ✅/⚠️ |
| --------- | -------------- | ---------------------------------------------- | ----- |
| 101       | S              | Message Received Invalid                       | ✅    |
| 201       | D              | Required Data Element Missing                  | ✅    |
| 203       | S              | Format of one or more Data Elements is Invalid | ✅    |
| 301       | S              | Transaction ID Not Recognised                  | ✅    |
| 302       | D              | Data Decryption Failure                        | ✅    |
| 403       | S              | Transient System Failure                       | ✅    |
| 404       | D              | Permanent System Failure                       | ✅    |
| 305       | A              | Transaction data not valid                     | ✅    |

所有 errorCode 與 EMV spec Table A.4 定義一致。

---

## 三、已知限制

| 項目                 | 說明                         | 影響                      |
| -------------------- | ---------------------------- | ------------------------- |
| S（SPC）+ Score 組合 | `riskAssesmentResult` 不寫入 | 正確行為，SPC 非 RBA 輸出 |

---

## 四、欄位與 Grafana Panel 對應

| Grafana Panel                     | 依賴欄位                                                     | 假資料正確性 |
| --------------------------------- | ------------------------------------------------------------ | ------------ |
| 交易成功率                        | `transStatus`                                                | ✅           |
| 免密驗證率                        | `ares_transStatus`                                           | ✅           |
| 挑戰成功率                        | `rreq_transStatus`                                           | ✅           |
| Visa Score 分布                   | `visaScoreMessageExtension.visaRiskBasedAuthenticationScore` | ✅           |
| MC Decision 分布                  | `mastercardMessageExtension.decision`                        | ✅           |
| **Visa Score 風險等級分布（新）** | `riskAssesmentResult` + `visaScoreMessageExtension`          | ✅           |
| **MC Score 風險等級分布（新）**   | `riskAssesmentResult` + `mastercardMessageExtension.score`   | ✅           |
| 錯誤代碼摘要                      | `errorCode` / `errorComponent`                               | ✅           |
| RBA 執行時間                      | `performance_metrics[RiskEvaluationService.evaluate]`        | ✅           |
