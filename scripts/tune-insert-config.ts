/**
 * 掃描 SERVER_* 參數組合，找出本機 ES 吞吐最高且零失敗的設定。
 * 用法：npm run tune-insert
 * 環境：TUNE_SAMPLE=30000（每組筆數）、ES_URL / ES_USER / ES_PASS
 */
import { batchInsertToEs } from '../server/batchInsert.js'
import { getInsertConfig, type InsertConfig } from '../server/insertConfig.js'
import type { InsertMetricsSnapshot } from '../server/insertMetrics.js'
import { buildCliFormData } from './cliFormDefaults.js'

type TuneCase = Pick<InsertConfig, 'concurrency' | 'bulkSize' | 'generationParallel' | 'docsPerGenTask'>

const SAMPLE = Number.parseInt(process.env.TUNE_SAMPLE ?? '30000', 10)
const esUrl = process.env.ES_URL ?? 'http://localhost:9200'
const username = process.env.ES_USER ?? 'elastic'
const password = process.env.ES_PASS ?? '123456'
const mode = (process.env.BATCH_MODE ?? 'acs') as 'acs' | 'dss'

const formData = buildCliFormData(SAMPLE, mode)

function applyEnv(c: TuneCase) {
  process.env.SERVER_CONCURRENCY = String(c.concurrency)
  process.env.SERVER_BULK_SIZE = String(c.bulkSize)
  process.env.SERVER_GENERATION_PARALLEL = String(c.generationParallel)
  process.env.SERVER_DOCS_PER_GEN_TASK = String(c.docsPerGenTask)
  process.env.SERVER_BULK_REFRESH = 'false'
}

async function runCase(c: TuneCase): Promise<InsertMetricsSnapshot & { score: number }> {
  applyEnv(c)
  const cfg = getInsertConfig()
  const result = await batchInsertToEs({
    formData,
    count: SAMPLE,
    esUrl,
    username,
    password,
    mode,
    errorMixPercent: 15
  })
  const m = result.metrics
  const failPenalty = m.error > 0 ? 0 : 1
  const latencyPenalty =
    m.bulkLatencyMs.p95 > 2000 ? 0.85 : m.bulkLatencyMs.p95 > 1200 ? 0.95 : 1
  const score = m.docsPerSec * failPenalty * latencyPenalty
  return { ...m, score: Math.round(score) }
}

function phaseA(): TuneCase[] {
  const concurrencies = [16, 24, 32, 48]
  const bulkSizes = [3000, 5000, 8000]
  const cases: TuneCase[] = []
  for (const concurrency of concurrencies) {
    for (const bulkSize of bulkSizes) {
      cases.push({ concurrency, bulkSize, generationParallel: 12, docsPerGenTask: 200 })
    }
  }
  return cases
}

function phaseB(base: TuneCase): TuneCase[] {
  const cases: TuneCase[] = []
  for (const generationParallel of [8, 12, 16]) {
    for (const docsPerGenTask of [100, 200, 400]) {
      cases.push({ ...base, generationParallel, docsPerGenTask })
    }
  }
  return cases
}

type Row = TuneCase & { docsPerSec: number; durationMs: number; error: number; bulkP95: number; bulkReq: number; peakIf: number; score: number }

function printTable(title: string, rows: Row[]) {
  console.log(`\n=== ${title} ===`)
  console.log(
    'conc  bulk  genPar  docs/T  筆/s    秒    err  bulk#  p95ms  peakIF  score'
  )
  for (const r of rows) {
    console.log(
      `${String(r.concurrency).padStart(4)}  ${String(r.bulkSize).padStart(5)}  ${String(r.generationParallel).padStart(5)}  ${String(r.docsPerGenTask).padStart(5)}  ${String(r.docsPerSec).padStart(6)}  ${(r.durationMs / 1000).toFixed(2).padStart(5)}  ${String(r.error).padStart(4)}  ${String(r.bulkReq).padStart(5)}  ${String(r.bulkP95).padStart(5)}  ${String(r.peakIf).padStart(6)}  ${String(r.score).padStart(5)}`
    )
  }
}

console.log(`調參樣本：每組 ${SAMPLE.toLocaleString()} 筆 → ${esUrl} (${username})`)

// 暖機（讓 JVM/連線池穩定；不計分）
console.log('\n暖機 5,000 筆...')
applyEnv({ concurrency: 24, bulkSize: 5000, generationParallel: 12, docsPerGenTask: 200 })
await batchInsertToEs({
  formData: buildCliFormData(5000, mode),
  count: 5000,
  esUrl,
  username,
  password,
  mode,
  errorMixPercent: 15
})

const phaseARows: Row[] = []
for (const c of phaseA()) {
  process.stdout.write(
    `  [A] c=${c.concurrency} bulk=${c.bulkSize} ... `
  )
  const m = await runCase(c)
  phaseARows.push({
    ...c,
    docsPerSec: m.docsPerSec,
    durationMs: m.durationMs,
    error: m.error,
    bulkP95: m.bulkLatencyMs.p95,
    bulkReq: m.bulkRequests,
    peakIf: m.peakInFlight,
    score: m.score
  })
  console.log(`${m.docsPerSec} 筆/s (p95 ${m.bulkLatencyMs.p95}ms)`)
}

phaseARows.sort((a, b) => b.score - a.score)
printTable('Phase A：並發 × bulk（gen=12, task=200）', phaseARows)

const bestA = phaseARows[0]!
const phaseBRows: Row[] = []
for (const c of phaseB(bestA)) {
  process.stdout.write(
    `  [B] gen=${c.generationParallel} task=${c.docsPerGenTask} ... `
  )
  const m = await runCase(c)
  phaseBRows.push({
    ...c,
    docsPerSec: m.docsPerSec,
    durationMs: m.durationMs,
    error: m.error,
    bulkP95: m.bulkLatencyMs.p95,
    bulkReq: m.bulkRequests,
    peakIf: m.peakInFlight,
    score: m.score
  })
  console.log(`${m.docsPerSec} 筆/s`)
}

phaseBRows.sort((a, b) => b.score - a.score)
printTable(`Phase B：產生參數（conc=${bestA.concurrency} bulk=${bestA.bulkSize}）`, phaseBRows)

const winner = phaseBRows[0] ?? bestA
console.log('\n════════ 建議寫入 .env.server ════════')
console.log(`SERVER_CONCURRENCY=${winner.concurrency}`)
console.log(`SERVER_BULK_SIZE=${winner.bulkSize}`)
console.log(`SERVER_GENERATION_PARALLEL=${winner.generationParallel}`)
console.log(`SERVER_DOCS_PER_GEN_TASK=${winner.docsPerGenTask}`)
console.log(`SERVER_PROGRESS_LOG_MS=2000`)
console.log(`# 實測 ${winner.docsPerSec.toLocaleString()} 筆/s | bulk p95 ${winner.bulkP95}ms | ${SAMPLE.toLocaleString()} 筆樣本`)
console.log('══════════════════════════════════════\n')
