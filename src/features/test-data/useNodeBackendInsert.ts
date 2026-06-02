/**
 * Node.js 後端批量插入
 * 使用 SSE 串流即時接收進度，顯示效果與瀏覽器直連一致。
 * 需先啟動：npm run server
 */
import { reactive, ref } from 'vue'
import { getBatchErrorMixPercent, isBatchErrorMixEnabled } from '@/shared/utils/batchErrorMix'
import type { BulkLogEntry } from '@/features/test-data/components/BulkProgressPanel.vue'
import type { TestDataFormApi } from '@/features/test-data/useElasticsearchInsert'

const NODE_SERVER_URL = import.meta.env.VITE_NODE_SERVER_URL || 'http://localhost:3001'

export function useNodeBackendInsert(formApi: TestDataFormApi) {
  const posting = ref(false)

  const progress = reactive({
    visible: false,
    finished: false,
    phaseLabel: 'Node.js 後端插入',
    summary: null as null,
    current: 0,
    total: 0,
    success: 0,
    error: 0,
    elapsedSec: 0,
    logs: [] as BulkLogEntry[],
    errors: [] as string[]
  })

  let timer: ReturnType<typeof setInterval> | null = null
  let startAt = 0

  function startTimer() {
    startAt = Date.now()
    if (timer) clearInterval(timer)
    timer = setInterval(() => {
      progress.elapsedSec = Math.round((Date.now() - startAt) / 1000)
    }, 1000)
  }

  function stopTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
    progress.elapsedSec = Math.round((Date.now() - startAt) / 1000)
  }

  function pushLog(type: BulkLogEntry['type'], message: string) {
    progress.logs.push({ type, message, at: new Date().toLocaleTimeString() })
    if (progress.logs.length > 200) progress.logs.splice(0, progress.logs.length - 200)
  }

  function closeProgress() {
    stopTimer()
    progress.visible = false
  }

  async function batchInsertViaNode() {
    if (posting.value) return
    posting.value = true

    const total = Math.max(1, Number.parseInt(formApi.form.batchSize, 10) || 1)
    const formData = formApi.getFormData()
    const errorMixPercent = isBatchErrorMixEnabled(formData)
      ? getBatchErrorMixPercent(formData)
      : undefined

    // 初始化 progress
    progress.visible = true
    progress.finished = false
    progress.current = 0
    progress.total = total
    progress.success = 0
    progress.error = 0
    progress.logs = []
    progress.errors = []
    progress.phaseLabel = 'Node.js 後端插入中...'
    startTimer()

    formApi.setStatus(`透過 Node.js 後端插入 ${total} 筆...`, 'info')
    pushLog('info', `開始插入 ${total} 筆（詳見 server 終端效能報告）`)

    try {
      const res = await fetch(`${NODE_SERVER_URL}/batch-insert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          formData,
          count: total,
          esUrl: formData.baseUrl,
          username: formData.username,
          password: formData.password,
          mode: formApi.form.mode,
          errorMixPercent
        })
      })

      if (!res.ok || !res.body) {
        const err = (await res.json().catch(() => ({ error: `HTTP ${res.status}` }))) as {
          error?: string
        }
        throw new Error(err.error || `HTTP ${res.status}`)
      }

      // 讀 SSE 串流
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let buf = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })

        // 解析完整行（SSE 格式：data: {...}\n\n）
        const lines = buf.split('\n')
        buf = lines.pop() ?? ''

        for (const line of lines) {
          const trimmed = line.replace(/^data:\s*/, '').trim()
          if (!trimmed) continue
          try {
            const event = JSON.parse(trimmed) as {
              type: string
              success?: number
              error?: number
              current?: number
              total?: number
              durationMs?: number
              message?: string
            }

            if (event.type === 'progress') {
              progress.success = event.success ?? 0
              progress.error = event.error ?? 0
              progress.current = event.current ?? 0
              progress.total = event.total ?? total
            } else if (event.type === 'done') {
              const durationMs = event.durationMs ?? 0
              const speed = durationMs > 0 ? Math.round(progress.success / (durationMs / 1000)) : 0
              progress.finished = true
              progress.phaseLabel = ''
              stopTimer()
              pushLog(
                'success',
                `完成 ${progress.success}/${total}，${durationMs}ms（${speed} 筆/s）`
              )
              formApi.setStatus(
                `Node 完成：${progress.success} 筆，${durationMs}ms（${speed} 筆/s）`,
                'success'
              )
            } else if (event.type === 'error') {
              throw new Error(event.message ?? '未知錯誤')
            }
          } catch {
            // 忽略非 JSON 行
          }
        }
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      stopTimer()
      progress.finished = true
      progress.phaseLabel = ''
      pushLog('error', `失敗：${msg}`)
      formApi.setStatus(`Node 後端插入失敗：${msg}`, 'error')
    } finally {
      posting.value = false
    }
  }

  return { posting, progress, batchInsertViaNode, closeProgress }
}
