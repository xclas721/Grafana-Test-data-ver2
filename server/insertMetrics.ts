import type { InsertConfig } from './insertConfig.js'

export type InsertMetricsSnapshot = {
  count: number
  success: number
  error: number
  durationMs: number
  genMs: number
  waitSlotMs: number
  postMs: number
  bulkRequests: number
  bulkBytes: number
  peakInFlight: number
  bulkLatencyMs: { avg: number; p95: number; max: number }
  docsPerSec: number
  config: InsertConfig
}

export class InsertMetrics {
  genMs = 0
  waitSlotMs = 0
  postMs = 0
  bulkRequests = 0
  bulkBytes = 0
  peakInFlight = 0
  private bulkLatencies: number[] = []

  constructor(private readonly config: InsertConfig) {}

  recordBulkLatency(ms: number) {
    this.bulkLatencies.push(ms)
    this.bulkRequests++
  }

  recordInFlight(n: number) {
    if (n > this.peakInFlight) this.peakInFlight = n
  }

  private percentile(sorted: number[], p: number): number {
    if (sorted.length === 0) return 0
    const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)
    return sorted[idx] ?? 0
  }

  snapshot(count: number, success: number, error: number, durationMs: number): InsertMetricsSnapshot {
    const sorted = [...this.bulkLatencies].sort((a, b) => a - b)
    const sum = sorted.reduce((a, b) => a + b, 0)
    const avg = sorted.length ? Math.round(sum / sorted.length) : 0
    return {
      count,
      success,
      error,
      durationMs,
      genMs: Math.round(this.genMs),
      waitSlotMs: Math.round(this.waitSlotMs),
      postMs: Math.round(this.postMs),
      bulkRequests: this.bulkRequests,
      bulkBytes: this.bulkBytes,
      peakInFlight: this.peakInFlight,
      bulkLatencyMs: {
        avg,
        p95: this.percentile(sorted, 95),
        max: sorted[sorted.length - 1] ?? 0
      },
      docsPerSec: durationMs > 0 ? Math.round((success / durationMs) * 1000) : 0,
      config: this.config
    }
  }

  printReport(s: InsertMetricsSnapshot) {
    const total = s.durationMs || 1
    const pct = (ms: number) => `${((ms / total) * 100).toFixed(1)}%`
    const mb = (s.bulkBytes / 1024 / 1024).toFixed(2)

    const lines: string[] = [
      '',
      '════════ batch-insert 效能報告 ════════',
      `總計: ${s.count.toLocaleString()} 筆 | 成功 ${s.success.toLocaleString()} | 失敗 ${s.error.toLocaleString()} | ${(s.durationMs / 1000).toFixed(2)}s | ${s.docsPerSec.toLocaleString()} 筆/s`,
      '',
      '時間分布:',
      `  產生文件     ${(s.genMs / 1000).toFixed(2)}s  (${pct(s.genMs).padStart(6)})  parallel=${s.config.generationParallel}  docs/task=${s.config.docsPerGenTask}`,
      `  等待並發槽   ${(s.waitSlotMs / 1000).toFixed(2)}s  (${pct(s.waitSlotMs).padStart(6)})`,
      `  POST _bulk   ${(s.postMs / 1000).toFixed(2)}s  (${pct(s.postMs).padStart(6)})  請求 ${s.bulkRequests} 次 | 出站 ${mb} MB | 平均 ${s.bulkLatencyMs.avg}ms | p95 ${s.bulkLatencyMs.p95}ms | 峰值 in-flight ${s.peakInFlight}`,
      '',
      `目前設定: SERVER_CONCURRENCY=${s.config.concurrency}  SERVER_BULK_SIZE=${s.config.bulkSize}  SERVER_GENERATION_PARALLEL=${s.config.generationParallel}  refresh=${s.config.bulkRefresh ? 'true' : 'false'}`,
      '',
      '建議（依本次比例推估，請對照你的 ES 負載再調）:'
    ]

    for (const tip of buildTuningHints(s)) {
      lines.push(`  • ${tip}`)
    }

    lines.push('════════════════════════════════════════', '')
    console.log(lines.join('\n'))
  }
}

function buildTuningHints(s: InsertMetricsSnapshot): string[] {
  const hints: string[] = []
  const total = s.durationMs || 1
  const genRatio = s.genMs / total
  const postRatio = s.postMs / total
  const { config } = s

  if (genRatio > 0.45) {
    const suggest = Math.min(64, config.generationParallel + Math.max(2, Math.ceil(config.generationParallel * 0.5)))
    hints.push(
      `產生文件佔 ${(genRatio * 100).toFixed(0)}%（CPU）→ 可提高 SERVER_GENERATION_PARALLEL（目前 ${config.generationParallel}），建議試 ${suggest}`
    )
    if (config.docsPerGenTask < 200) {
      hints.push(
        `或提高 SERVER_DOCS_PER_GEN_TASK（目前 ${config.docsPerGenTask}）減少 task 切換，建議試 ${Math.min(500, config.docsPerGenTask * 2)}`
      )
    }
  }

  if (postRatio > 0.35 && s.bulkLatencyMs.avg < 400 && s.peakInFlight >= config.concurrency * 0.85) {
    const suggest = Math.min(128, config.concurrency + Math.max(4, Math.ceil(config.concurrency * 0.25)))
    hints.push(
      `POST 佔 ${(postRatio * 100).toFixed(0)}% 且 in-flight 常滿、bulk 延遲不高 → 可提高 SERVER_CONCURRENCY（目前 ${config.concurrency}），建議試 ${suggest}`
    )
  }

  if (postRatio > 0.35 && s.bulkLatencyMs.avg < 250 && s.bulkRequests > 5) {
    const suggest = Math.min(20_000, config.bulkSize + Math.ceil(config.bulkSize * 0.5))
    hints.push(
      `bulk 平均延遲低 → 可提高 SERVER_BULK_SIZE（目前 ${config.bulkSize}）減少 HTTP 次數，建議試 ${suggest}`
    )
  }

  if (s.bulkLatencyMs.p95 > 800 || s.bulkLatencyMs.avg > 600) {
    hints.push(
      `bulk 延遲偏高（avg ${s.bulkLatencyMs.avg}ms / p95 ${s.bulkLatencyMs.p95}ms）→ ES 或網路瓶頸，建議降低 SERVER_CONCURRENCY 或檢查 ES heap / 磁碟`
    )
  }

  if (s.error > 0 && s.error / (s.count || 1) > 0.01) {
    hints.push(`失敗率 ${((s.error / s.count) * 100).toFixed(2)}% → 檢查 ES 錯誤日誌，並考慮降低並發`)
  }

  if (config.bulkRefresh) {
    hints.push('已啟用 refresh（SERVER_BULK_REFRESH=true）→ 大量灌資料可設為 false 以加速')
  }

  if (hints.length === 0) {
    hints.push('本次比例均衡；若要再壓測可小幅提高 GENERATION_PARALLEL 與 CONCURRENCY 觀察瓶頸是否轉移')
  }

  return hints
}
