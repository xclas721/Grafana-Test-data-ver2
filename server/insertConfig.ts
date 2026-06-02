import os from 'node:os'

function parseIntEnv(key: string, fallback: number, min: number, max: number): number {
  const raw = process.env[key]
  if (raw === undefined || raw === '') return fallback
  const n = Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.max(min, Math.min(max, n))
}

const cpuCount = Math.max(1, os.cpus().length)

/** 可由環境變數覆寫；未設定時使用偏快的預設值 */
export function getInsertConfig() {
  const concurrency = parseIntEnv('SERVER_CONCURRENCY', Math.min(32, cpuCount * 4), 1, 128)
  const bulkSize = parseIntEnv('SERVER_BULK_SIZE', 4000, 200, 20_000)
  const generationParallel = parseIntEnv(
    'SERVER_GENERATION_PARALLEL',
    Math.min(12, cpuCount),
    1,
    64
  )
  const docsPerGenTask = parseIntEnv('SERVER_DOCS_PER_GEN_TASK', 100, 10, 2000)
  const progressLogMs = parseIntEnv('SERVER_PROGRESS_LOG_MS', 2000, 500, 60_000)
  const bulkRefresh = process.env.SERVER_BULK_REFRESH === 'true'

  return {
    concurrency,
    bulkSize,
    generationParallel,
    docsPerGenTask,
    progressLogMs,
    bulkRefresh,
    cpuCount
  }
}

export type InsertConfig = ReturnType<typeof getInsertConfig>
