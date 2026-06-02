/**
 * Grafana Test Data — Node.js 後端
 *
 * 並行產生 + 高並發 bulk POST；完成後輸出效能報告與調參建議。
 * 啟動：npm run server（會載入專案根 `.env.server`）
 *
 * 環境變數（可選，見 .env.server.example）：
 *   SERVER_CONCURRENCY          預設 min(32, CPU×4)
 *   SERVER_BULK_SIZE            預設 4000
 *   SERVER_GENERATION_PARALLEL  預設 min(12, CPU)
 *   SERVER_DOCS_PER_GEN_TASK    預設 100
 *   SERVER_PROGRESS_LOG_MS      主控台進度間隔，預設 2000
 *   SERVER_BULK_REFRESH=true    預設 false（refresh=false 較快）
 */
import { loadEnvServer } from './loadEnvServer.js'

loadEnvServer()

import express from 'express'
import cors from 'cors'
import { batchInsertToEs, getInsertConfig } from './batchInsert.js'
import { InsertMetrics } from './insertMetrics.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' }))

const PORT = Number(process.env.SERVER_PORT) || 3001

app.get('/health', (_req, res) => {
  const cfg = getInsertConfig()
  res.json({
    ok: true,
    concurrency: cfg.concurrency,
    bulkSize: cfg.bulkSize,
    generationParallel: cfg.generationParallel,
    docsPerGenTask: cfg.docsPerGenTask,
    bulkRefresh: cfg.bulkRefresh,
    cpuCount: cfg.cpuCount
  })
})

app.post('/batch-insert', async (req, res) => {
  const { formData, count, esUrl, username, password, mode, errorMixPercent } = req.body as {
    formData: Record<string, string>
    count: number
    esUrl: string
    username: string
    password: string
    mode?: 'acs' | 'dss'
    errorMixPercent?: number
  }

  if (!formData || !count || !esUrl || !username || !password) {
    res.status(400).json({ error: '缺少必要欄位：formData, count, esUrl, username, password' })
    return
  }

  if (count > 10_000_000) {
    res.status(400).json({ error: 'count 上限 10,000,000' })
    return
  }

  const cfg = getInsertConfig()

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  function send(data: Record<string, unknown>) {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const startMs = Date.now()
  let lastLogMs = 0
  let lastLoggedCurrent = 0

  console.log(
    `[${new Date().toLocaleTimeString()}] batch-insert 開始 count=${count.toLocaleString()} mode=${mode ?? 'acs'} | concurrency=${cfg.concurrency} bulk=${cfg.bulkSize} genParallel=${cfg.generationParallel}`
  )

  try {
    const result = await batchInsertToEs({
      formData,
      count,
      esUrl,
      username,
      password,
      mode,
      errorMixPercent,
      onProgress: (success, err, total) => {
        const current = success + err
        const now = Date.now()
        const elapsedSec = (now - startMs) / 1000
        const shouldLog =
          current === total ||
          now - lastLogMs >= cfg.progressLogMs ||
          current - lastLoggedCurrent >= Math.max(5000, Math.floor(total * 0.05))

        if (shouldLog) {
          const rate = elapsedSec > 0 ? Math.round(current / elapsedSec) : 0
          const pct = total > 0 ? Math.round((current / total) * 100) : 0
          console.log(
            `  [進度] ${current.toLocaleString()}/${total.toLocaleString()} (${pct}%) | ${rate.toLocaleString()} 筆/s | ok ${success.toLocaleString()} err ${err}`
          )
          lastLogMs = now
          lastLoggedCurrent = current
        }

        send({
          type: 'progress',
          success,
          error: err,
          current,
          total,
          docsPerSec: elapsedSec > 0 ? Math.round(current / elapsedSec) : 0,
          durationMs: now - startMs
        })
      }
    })

    const reporter = new InsertMetrics(cfg)
    reporter.printReport(result.metrics)

    send({ type: 'done', durationMs: result.durationMs, metrics: result.metrics })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[batch-insert] 失敗：${msg}`)
    send({ type: 'error', message: msg })
  } finally {
    res.end()
  }
})

app.listen(PORT, () => {
  const cfg = getInsertConfig()
  console.log(`[Grafana Test Data Server] http://localhost:${PORT}`)
  console.log(
    `  並發 ${cfg.concurrency} | bulk ${cfg.bulkSize} | 產生 parallel ${cfg.generationParallel}×${cfg.docsPerGenTask} | refresh=${cfg.bulkRefresh}`
  )
  console.log('  完成批量後請看終端「效能報告」與建議的環境變數調整值')
})
