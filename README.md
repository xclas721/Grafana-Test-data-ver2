# Brainwave Frontend

Brainwave Frontend 是一個基於 Vue 3 + TypeScript + Vite 的前端專案，採用靜態路由架構，提供可擴充的基礎設施與工具庫，支援後台管理與前台會員流程。

## 特色

- **現代化 UI** - Tailwind CSS + DaisyUI，支援 10 種精選主題
- **國際化** - 內建 i18n 支援（繁體中文、英文）
- **模組化設計** - 清晰檔案結構，利於擴充
- **共用工具庫** - 格式化、驗證、檔案處理、表單控制等工具
- **共用組件** - 按鈕、卡片、輸入框、頁面標題等元件
- **狀態管理** - Pinia Store（應用設定、語言、主題、載入狀態）
- **型別安全** - 完整 TypeScript 支援

## 快速開始

1. **先啟動後端**（請至後端專案執行，並確認 API 可連線）。
2. **啟動前端**：下方安裝後執行 `npm run dev`。
3. 開啟瀏覽器後，可用 **測試帳號**：`demo` / `123456`（後端啟動時會自動建立）。

### 環境需求

- Node.js: `^20.19.0 || >=22.12.0`（與 `package.json` 的 `engines` 一致；GitHub Actions **CI** 於 `main`／`develop` 對 **20**、**22** 兩個主版皆會跑檢查）
- npm 或 yarn

### 安裝

```bash
npm install
```

### 開發

```bash
# 啟動開發伺服器（預設 http://localhost:6600）
npm run dev

# 指定 port
VITE_FRONTEND_PORT=3001 npm run dev
```

### 建置

```bash
# 型別檢查 + 建置
npm run build

# 僅建置
npm run build-only

# 型別檢查
npm run type-check
```

### 預覽

```bash
npm run preview
```

### 格式化

```bash
npm run format
```

## 專案結構

```
src/
├── assets/          # 靜態資源（CSS、圖片等）
├── layouts/         # 版面配置組件
├── locales/         # i18n 語言檔
├── pages/           # 頁面組件
├── router/          # 路由配置
├── shared/          # 共用資源
│   ├── components/  # 共用組件
│   ├── config/      # 應用設定
│   ├── services/    # API 服務
│   └── utils/       # 工具函數
└── stores/          # Pinia Store
```

詳細結構請參考 [`專案樹狀架構.md`](./專案樹狀架構.md)

## 技術棧

- **框架**: Vue 3 (Composition API)
- **語言**: TypeScript
- **建置工具**: Vite
- **狀態管理**: Pinia
- **路由**: Vue Router
- **樣式**: Tailwind CSS v4 + DaisyUI v5
- **國際化**: Vue I18n
- **日期處理**: Luxon
- **工具庫**: @vueuse/core
- **訊息提示**: SweetAlert2

## 主題

專案支援 10 種精選主題：

- **brainwave** - 自訂主題（預設）
- **brainwave-dark** - 自訂深色主題
- **light** - 淺色
- **dark** - 深色
- **night** - 夜晚
- **cmyk** - CMYK
- **business** - 商務
- **sunset** - 日落
- **abyss** - 深淵
- **silk** - 絲綢

## 文件

- [`本專案前端介紹.md`](./docs/本專案前端介紹.md) - 前端設計與功能綜覽（架構、路由、登入、API、組件、Store 等）
- [`專案樹狀架構.md`](./專案樹狀架構.md) - 完整的專案結構說明

| 類別               | 文件                                                                                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **技術總覽**       | [`技術棧與架構總覽.md`](./技術棧與架構總覽.md)（與 README 同層）                                                                                                  |
| **結構與流程**     | [`架構與請求流程.md`](./docs/架構與請求流程.md)、[`專案樹狀架構.md`](./專案樹狀架構.md)、[`終端機操作指令.md`](./終端機操作指令.md)（與 README 同層）             |
| **認證與授權**     | [`認證與權杖說明.md`](./docs/認證與權杖說明.md)、[`權杖儲存策略說明.md`](./docs/權杖儲存策略說明.md)                                                              |
| **契約與錯誤治理** | [`介面契約同步說明.md`](./docs/介面契約同步說明.md)、[`錯誤處理與請求追蹤說明.md`](./docs/錯誤處理與請求追蹤說明.md)、[`設定治理說明.md`](./docs/設定治理說明.md) |
| **部署與維護**     | [`前端部署指南.md`](./docs/前端部署指南.md)、[`文件維護與最佳實踐.md`](./docs/文件維護與最佳實踐.md)                                                              |

## 環境變數

專案支援以下環境變數（透過 `.env` 檔案設定）：

- `VITE_API_BASE_URL` - 後端 API 基礎 URL（預設: `http://localhost:8080`）
- `VITE_FRONTEND_PORT` - 前端開發伺服器 port（預設: `6600`）
- `VITE_FRONTEND_CONTEXT_PATH` - 前端上下文路徑（預設: `/`）
- `VITE_BACKEND_API_TIMEOUT` - API 請求超時時間（預設: `60000` ms）
- `VITE_PAGE_SIZE` - 預設分頁大小（預設: `10`）
- `VITE_SYSTEM_ID` - 系統識別碼（預設: `Brainwave`）
- `VITE_HTTPS_ENABLED` - 啟用 HTTPS（預設: `false`）
- `VITE_HOST` - 開發伺服器主機（預設: `localhost`）

## 開發規範

- 使用 TypeScript 進行型別檢查
- 使用 Prettier 進行程式碼格式化
- 遵循 Vue 3 Composition API 最佳實踐
- 組件使用 Tailwind CSS 類別，避免自訂 CSS
- 使用 i18n 進行所有文字內容的國際化

## 貢獻

歡迎提交 Issue 或 Pull Request。

## 授權

本專案為內部專案，僅供團隊使用。
