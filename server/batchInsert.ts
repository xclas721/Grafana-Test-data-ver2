/**
 * Node.js 批量插入：分片產生 + keep-alive bulk + 效能報告
 */
import { Agent, fetch } from 'undici'
import type { TestDataFormMap } from '@/features/test-data/buildTestDataDocument.js'
import { generateDocsBatch, resolveIndexName } from './docGenerate.js'
import { getInsertConfig } from './insertConfig.js'
import { InsertMetrics, type InsertMetricsSnapshot } from './insertMetrics.js'

export { getInsertConfig } from './insertConfig.js'

let bulkDispatcher: Agent | null = null
let dispatcherConnections = 0

function getBulkDispatcher(connections: number): Agent {
  if (!bulkDispatcher || dispatcherConnections !== connections) {
    bulkDispatcher = new Agent({
      connections,
      pipelining: 1,
      keepAliveTimeout: 60_000,
      keepAliveMaxTimeout: 120_000
    })
    dispatcherConnections = connections
  }
  return bulkDispatcher
}

function basicAuth(username: string, password: string) {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`
}

export interface BatchInsertRequest {
  formData: TestDataFormMap
  count: number
  esUrl: string
  username: string
  password: string
  mode?: 'acs' | 'dss'
  errorMixPercent?: number
  onProgress?: (success: number, error: number, total: number) => void
}

export interface BatchInsertResult {
  success: number
  error: number
  durationMs: number
  metrics: InsertMetricsSnapshot
}

export async function batchInsertToEs(req: BatchInsertRequest): Promise<BatchInsertResult> {
  const { formData, count, esUrl, username, password, mode = 'acs', errorMixPercent, onProgress } = req
  const config = getInsertConfig()
  const metrics = new InsertMetrics(config)
  const indexBase = resolveIndexName(mode)
  const auth = basicAuth(username, password)
  const refreshParam = config.bulkRefresh ? 'refresh=wait_for' : 'refresh=false'
  const bulkUrl = `${esUrl.replace(/\/$/, '')}/_bulk?${refreshParam}`
  const dispatcher = getBulkDispatcher(config.concurrency)

  let success = 0
  let error = 0
  const startMs = Date.now()

  const inFlight = new Set<Promise<void>>()
  let bulkLines: string[] = []
  let bulkCount = 0

  async function flush(force = false) {
    if (bulkCount === 0) return
    if (!force && bulkCount < config.bulkSize) return

    const waitStart = performance.now()
    while (inFlight.size >= config.concurrency) {
      await Promise.race([...inFlight])
    }
    metrics.waitSlotMs += performance.now() - waitStart

    const payload = bulkLines.join('') + '\n'
    const recordCount = bulkCount
    const payloadBytes = Buffer.byteLength(payload, 'utf8')
    bulkLines = []
    bulkCount = 0

    const task = (async () => {
      const postStart = performance.now()
      try {
        const res = await fetch(bulkUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-ndjson',
            Authorization: auth
          },
          body: payload,
          dispatcher
        })
        const json = (await res.json()) as { errors?: boolean }
        if (!res.ok || json.errors) {
          error += recordCount
        } else {
          success += recordCount
        }
      } catch {
        error += recordCount
      } finally {
        const postMs = performance.now() - postStart
        metrics.postMs += postMs
        metrics.recordBulkLatency(postMs)
        metrics.bulkBytes += payloadBytes
      }
    })()

    inFlight.add(task)
    metrics.recordInFlight(inFlight.size + 1)
    void task.finally(() => {
      inFlight.delete(task)
      metrics.recordInFlight(inFlight.size)
    })
  }

  const waveSize = config.generationParallel * config.docsPerGenTask
  let index = 0

  while (index < count) {
    const remaining = count - index
    const thisWave = Math.min(waveSize, remaining)
    const perTask = Math.ceil(thisWave / config.generationParallel)

    const genStart = performance.now()
    const taskCounts: number[] = []
    let offset = 0
    for (let t = 0; t < config.generationParallel && offset < thisWave; t++) {
      const n = Math.min(perTask, thisWave - offset)
      taskCounts.push(n)
      offset += n
    }

    const batches = await Promise.all(
      taskCounts.map((n) =>
        Promise.resolve().then(() => generateDocsBatch(formData, indexBase, mode, n, errorMixPercent))
      )
    )
    metrics.genMs += performance.now() - genStart

    for (const batch of batches) {
      error += batch.genErrors
      for (const ndjson of batch.lines) {
        bulkLines.push(ndjson)
        bulkCount++
        if (bulkCount >= config.bulkSize) {
          await flush()
          onProgress?.(success, error, count)
        }
      }
    }
    index += thisWave
  }

  await flush(true)
  await Promise.all([...inFlight])

  const durationMs = Date.now() - startMs
  const snapshot = metrics.snapshot(count, success, error, durationMs)
  return { success, error, durationMs, metrics: snapshot }
}
