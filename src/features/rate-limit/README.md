# DDoS 限流測試（Grafana-Test-data-ver2）

Web 版限流測試，對應原 `Grafana-Test-data` 的 PowerShell 腳本與 `src/views/ddos/` 模組。

## 目錄結構

```
src/features/rate-limit/
  constants.ts              # 文案、測試說明、側欄路由表
  DDoS*Test.vue             # 五種測試頁
  components/
    ApiConfigBar.vue        # 頂部 API 網域設定
    DDoSSection.vue
    DDoSTestIntro.vue
src/layouts/RateLimitLayout.vue   # API 列 + 子路由（掛在 MainLayout 下）
src/shared/utils/ddos-utils.ts
src/stores/apiConfig.ts
```

## 路由

| 路徑 | 說明 |
|------|------|
| `/rate-limit-test/areq-card` | AReq 卡號限流 |
| `/rate-limit-test/areq-merchant` | AReq 商戶限流 |
| `/rate-limit-test/creq-checkpoint1` | CReq 檢查點 1 |
| `/rate-limit-test/creq-checkpoint2` | CReq 檢查點 2 |
| `/rate-limit-test/3dsmethod` | 3DS Method 限流 |

側欄：**公用程式 → DDoS 限流測試**。

## 環境與 Proxy

1. 啟動 **acs-auth**（30100）、**acs-auth-web**（8050）。
2. 開發：頂欄 API 留空時，由 `vite.config.ts` 將 `/acs-auth`、`/acs-auth-web` 轉發至本機。
3. 部署：於 `.env` 設定 `VITE_ACS_AUTH_BASE`、`VITE_ACS_AUTH_WEB_BASE`，或由 nginx 反向代理（見 `.env.example`）。

設定會寫入 `localStorage`（鍵：`insightedge-es-api-config`），重新整理後保留。

## 操作

1. 確認頂欄 API 網域（或 proxy）。
2. 進入測試頁 → **載入預設值** → **開始測試**。
3. 查看日誌與 PASS / BLOCKED 統計；執行中可 **停止測試**。

## 後端 properties 參考

各頁「測試說明與原理」區塊有對應設定鍵，例如：

- 卡號：`bucket.acc.number.capacity`
- 商戶：`bucket.merchant.capacity`
- CReq / 3DS Method：見 `constants.ts` 內 `TEST_DESCRIPTIONS`
