/**
 * Grafana Test Data — Node.js 後端
 *
 * 提供比瀏覽器更高並發（20 連線 vs 瀏覽器 6 連線）的 ES 批量插入能力。
 * 啟動：npm run server
 */
import express from 'express'
import cors from 'cors'
import { batchInsertToEs, SERVER_CONCURRENCY, SERVER_BULK_SIZE } from './batchInsert.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))

const PORT = Number(process.env.SERVER_PORT) || 3001

/** GET /health — 確認 server 存活 */
app.get('/health', (_req, res) => {
  res.json({ ok: true, concurrency: SERVER_CONCURRENCY, bulkSize: SERVER_BULK_SIZE })
})

/**
 * POST /batch-insert
 * Body: { formData, count, esUrl, username, password, mode?, errorMixPercent? }
 * Response: { success, error, durationMs }
 */
/**
 * POST /batch-insert
 * SSE 串流：每 flush 一批就推送進度，前端即時顯示。
 * 格式：每行一個 JSON，最後一行 {"done":true,...}
 */
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

  // SSE headers
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  function send(data: Record<string, unknown>) {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  const startMs = Date.now()
  console.log(`[${new Date().toLocaleTimeString()}] batch-insert 開始：count=${count}, mode=${mode ?? 'acs'}`)

  try {
    await batchInsertToEs({
      formData, count, esUrl, username, password, mode, errorMixPercent,
      onProgress: (success, error, total) => {
        const current = success + error
        const pct = Math.round(current / total * 100)
        if (current % 5000 === 0 || current === total) {
          console.log(`  進度：${current}/${total} (${pct}%)`)
        }
        send({ type: 'progress', success, error, current, total, durationMs: Date.now() - startMs })
      }
    })

    const durationMs = Date.now() - startMs
    console.log(`[${new Date().toLocaleTimeString()}] 完成，${durationMs}ms`)
    send({ type: 'done', durationMs })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error(`[batch-insert] 失敗：${msg}`)
    send({ type: 'error', message: msg })
  } finally {
    res.end()
  }
})

app.listen(PORT, () => {
  console.log(`[Grafana Test Data Server] port ${PORT}`)
  console.log(`  並發數: ${SERVER_CONCURRENCY}（瀏覽器上限 6）`)
  console.log(`  bulk 大小: ${SERVER_BULK_SIZE} 筆/次`)
})
