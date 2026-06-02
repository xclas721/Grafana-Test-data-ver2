/**
 * CLI：直接呼叫 batchInsertToEs（與前端 Node 批量插入相同邏輯）
 * 用法：npm run batch-insert -- [筆數]
 */
import { loadEnvServer } from '../server/loadEnvServer.js'

loadEnvServer()

import { batchInsertToEs } from '../server/batchInsert.js'
import { InsertMetrics } from '../server/insertMetrics.js'
import { getInsertConfig } from '../server/insertConfig.js'
import { buildCliFormData } from './cliFormDefaults.js'

const count = Number.parseInt(process.argv[2] ?? process.env.BATCH_COUNT ?? '10000', 10)
const esUrl = process.env.ES_URL ?? 'http://localhost:9200'
const username = process.env.ES_USER ?? 'elastic'
const password = process.env.ES_PASS ?? '123456'
const mode = (process.env.BATCH_MODE ?? 'acs') as 'acs' | 'dss'

const formData = buildCliFormData(count, mode)
const cfg = getInsertConfig()

console.log(
  `開始插入 ${count.toLocaleString()} 筆 → ${esUrl} (${username}) | concurrency=${cfg.concurrency} bulk=${cfg.bulkSize}`
)

const reporter = new InsertMetrics(cfg)
let lastLog = 0

const result = await batchInsertToEs({
  formData,
  count,
  esUrl,
  username,
  password,
  mode,
  errorMixPercent: 15,
  onProgress: (ok, err, total) => {
    const current = ok + err
    const now = Date.now()
    if (current === total || now - lastLog >= cfg.progressLogMs) {
      console.log(`  [進度] ${current.toLocaleString()}/${total.toLocaleString()} ok=${ok} err=${err}`)
      lastLog = now
    }
  }
})

reporter.printReport(result.metrics)
if (result.error > 0) process.exitCode = 1
