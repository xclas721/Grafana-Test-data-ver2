import { reactive, ref } from 'vue'
import {
  PRESET_NO_ERROR,
  applyErrorPresetToFormData,
  pickRandomBatchErrorPreset
} from '@/shared/constants/emvThreeDSErrorPresets'
import { getBatchErrorMixPercent, isBatchErrorMixEnabled } from '@/shared/utils/batchErrorMix'
import { applyChallengeVerificationMix } from '@/shared/utils/challengeVerificationMix'
import {
  generateCardPool,
  RANDOM_CARD_SCHEMES,
  type PoolCard
} from '@/composables/useBusinessFieldRandomizer'
import {
  type ElasticsearchBulkResponse,
  fetchElasticsearchBulk
} from '@/shared/utils/elasticsearchBulk'
import {
  buildTestDataDocument,
  resolveIndexName,
  type TestDataFormMap
} from '@/features/test-data/buildTestDataDocument'
import {
  formatCalendarDay,
  formatCount,
  resolveScopeType,
  type BatchProgressSummary
} from '@/features/test-data/batchInsertProgress'
import { generateSharedTimestamp } from '@/features/test-data/testDataTimeRange'
import type { BulkLogEntry } from '@/features/test-data/components/BulkProgressPanel.vue'

export type TestDataFormApi = {
  form: {
    mode: 'acs' | 'dss'
    batchSize: string
    batchDays: string
    baseUrl: string
    username: string
    password: string
    currentDate: string
    enableCustomTimeRange: boolean
    enableAutoTimeRange: boolean
    startDateTime: string
    endDateTime: string
  }
  getFormData: () => TestDataFormMap
  generateRandomFields: (forcedCard?: PoolCard) => boolean
  refreshAutoTimeRange: () => void
  setStatus: (message: string, type: 'success' | 'warning' | 'info' | 'error') => void
}

const BULK_RECORD_LIMIT = 2000
const BULK_CONCURRENCY = 6

function basicAuthHeader(username: string, password: string) {
  return `Basic ${btoa(`${username}:${password}`)}`
}

function shouldRefreshTimeRange(data: TestDataFormMap, batchDays: number) {
  return (
    batchDays === 0 || (data.enableCustomTimeRange === 'on' && data.enableAutoTimeRange === 'on')
  )
}

export function useElasticsearchInsert(formApi: TestDataFormApi) {
  const posting = ref(false)
  const progress = reactive({
    visible: false,
    finished: false,
    phaseLabel: '',
    summary: null as BatchProgressSummary | null,
    current: 0,
    total: 0,
    success: 0,
    error: 0,
    elapsedSec: 0,
    logs: [] as BulkLogEntry[],
    errors: [] as string[]
  })

  let startAt = 0
  let timer: number | null = null

  function pushLog(type: BulkLogEntry['type'], message: string) {
    progress.logs.push({
      type,
      message,
      at: new Date().toLocaleTimeString()
    })
    if (progress.logs.length > 200) {
      progress.logs.splice(0, progress.logs.length - 200)
    }
  }

  function setPhaseLabel(label: string) {
    progress.phaseLabel = label
  }

  function startProgress(total: number, summary: BatchProgressSummary) {
    progress.visible = true
    progress.finished = false
    progress.summary = summary
    progress.phaseLabel = ''
    progress.current = 0
    progress.total = total
    progress.success = 0
    progress.error = 0
    progress.elapsedSec = 0
    progress.logs = []
    progress.errors = []
    startAt = Date.now()
    if (timer !== null) window.clearInterval(timer)
    timer = window.setInterval(() => {
      progress.elapsedSec = Math.round((Date.now() - startAt) / 1000)
    }, 1000)
  }

  function stopProgressTimer() {
    if (timer !== null) {
      window.clearInterval(timer)
      timer = null
    }
    progress.elapsedSec = Math.round((Date.now() - startAt) / 1000)
  }

  function closeProgress() {
    stopProgressTimer()
    progress.visible = false
  }

  function validateTimeRange(data: TestDataFormMap): boolean {
    if (data.enableCustomTimeRange === 'on' && (!data.startDateTime || !data.endDateTime)) {
      formApi.setStatus('請先設定自訂時間區間的起訖時間', 'error')
      return false
    }
    return true
  }

  async function insertOne() {
    if (posting.value) return
    posting.value = true
    try {
      const batchDays = Math.max(0, Number.parseInt(formApi.form.batchDays, 10) || 0)
      let data = formApi.getFormData()
      if (shouldRefreshTimeRange(data, batchDays)) {
        formApi.refreshAutoTimeRange()
        data = formApi.getFormData()
      }
      if (!validateTimeRange(data)) return

      const auth = basicAuthHeader(data.username, data.password)
      const indexBase = resolveIndexName(formApi.form.mode)
      const sharedTs = generateSharedTimestamp(data)
      const built = buildTestDataDocument(data, indexBase, sharedTs)
      const bulk =
        [
          JSON.stringify({ index: { _index: built.fullIndex } }),
          JSON.stringify(built.document)
        ].join('\n') + '\n'

      const res = await fetchElasticsearchBulk(data.baseUrl, auth, bulk)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = (await res.json()) as ElasticsearchBulkResponse
      if (json.errors) throw new Error('索引失敗')

      formApi.setStatus(`已插入到 ${built.fullIndex}`, 'success')
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      formApi.setStatus(`插入失敗: ${msg}`, 'error')
    } finally {
      posting.value = false
    }
  }

  async function batchInsert() {
    if (posting.value) return
    posting.value = true

    const total = Math.max(1, Number.parseInt(formApi.form.batchSize, 10) || 1)
    const days = Math.max(0, Number.parseInt(formApi.form.batchDays, 10) || 0)

    const errorDetails: string[] = []
    let success = 0
    let errorCount = 0

    try {
      let dataBase = formApi.getFormData()
      if (shouldRefreshTimeRange(dataBase, days)) {
        formApi.refreshAutoTimeRange()
        dataBase = formApi.getFormData()
      }
      if (!validateTimeRange(dataBase)) {
        closeProgress()
        return
      }

      const isCustomRange = dataBase.enableCustomTimeRange === 'on'
      const startDate = dataBase.currentDate || ''
      if (!isCustomRange && !startDate) {
        formApi.setStatus('請先選擇基準日期', 'error')
        closeProgress()
        return
      }

      const errorMixPercent = isBatchErrorMixEnabled(dataBase)
        ? getBatchErrorMixPercent(dataBase)
        : null

      startProgress(total, {
        total,
        mode: formApi.form.mode,
        scopeType: resolveScopeType(isCustomRange, days),
        scopeDays: days,
        startDateTime: dataBase.startDateTime,
        endDateTime: dataBase.endDateTime,
        errorMixPercent,
        chunkSize: BULK_RECORD_LIMIT,
        concurrency: BULK_CONCURRENCY
      })

      let cardPool: PoolCard[] | null = null
      if (dataBase.enableAcctNumberRandom === 'on') {
        const ratio = Math.max(1, Number.parseInt(String(dataBase.cardPoolRatio || '10'), 10) || 1)
        if (ratio > 1) {
          const schemes =
            dataBase.enableCardSchemeRandom === 'on'
              ? [...RANDOM_CARD_SCHEMES]
              : [String(dataBase.cardScheme || 'V')]
          const poolSize = Math.max(1, Math.ceil(total / ratio))
          cardPool = generateCardPool(poolSize, schemes)
          pushLog(
            'info',
            `卡號重複池：${poolSize} 張卡（倍率 ${ratio}，共 ${total} 筆，平均每卡約 ${ratio} 次）`
          )
        }
      }

      const baseUrl = dataBase.baseUrl
      const auth = basicAuthHeader(dataBase.username, dataBase.password)
      const inFlight = new Set<Promise<void>>()

      type BulkRecordMeta = { itemCount: number; dateStr: string }
      const bulkLines: string[] = []
      let bulkRecords: BulkRecordMeta[] = []

      async function waitForBulkSlot() {
        while (inFlight.size >= BULK_CONCURRENCY) {
          await Promise.race([...inFlight])
          await Promise.resolve()
        }
      }

      function analyzeBulkItems(
        items: Array<{ index?: { error?: { reason?: string } } }>,
        records: BulkRecordMeta[]
      ) {
        let cursor = 0
        let successRecords = 0
        let errorRecords = 0
        const errorReasons: string[] = []
        for (const record of records) {
          let recordError = false
          let reason = ''
          for (let i = 0; i < record.itemCount; i++) {
            const item = items[cursor]
            cursor += 1
            if (!item) {
              recordError = true
              if (!reason) reason = '批次回應不足'
              continue
            }
            const err = item.index?.error
            if (err) {
              recordError = true
              if (!reason) reason = err.reason || '索引失敗'
            }
          }
          if (recordError) {
            errorRecords += 1
            errorReasons.push(`日期 ${record.dateStr}：${reason || '索引失敗'}`)
          } else {
            successRecords += 1
          }
        }
        return { successRecords, errorRecords, errorReasons }
      }

      async function flushBulk(force = false) {
        if (bulkRecords.length === 0) return
        if (!force && bulkRecords.length < BULK_RECORD_LIMIT) return
        await waitForBulkSlot()
        const records = bulkRecords
        const payload = bulkLines.join('\n') + '\n'
        bulkRecords = []
        bulkLines.length = 0

        const task = (async () => {
          try {
            const res = await fetchElasticsearchBulk(baseUrl, auth, payload)
            const json = (await res.json()) as ElasticsearchBulkResponse
            if (!res.ok) throw new Error(`HTTP ${res.status}`)
            if (json.errors) {
              const items = json.items || []
              const analyzed = analyzeBulkItems(items, records)
              success += analyzed.successRecords
              errorCount += analyzed.errorRecords
              errorDetails.push(...analyzed.errorReasons)
            } else {
              success += records.length
            }
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e)
            errorCount += records.length
            records.forEach((record) => {
              errorDetails.push(`日期 ${record.dateStr}：索引失敗${msg ? ` (${msg})` : ''}`)
            })
          } finally {
            syncProgressUi()
          }
        })()

        inFlight.add(task)
        void task.finally(() => inFlight.delete(task))
      }

      const distributionDays = Math.max(1, days)
      const dailyCounts: number[] = []
      const average = Math.max(1, Math.floor(total / distributionDays))
      let remaining = total
      for (let d = 0; d < distributionDays; d++) {
        const take =
          d === distributionDays - 1
            ? remaining
            : Math.min(
                remaining,
                Math.max(1, average + Math.floor((Math.random() - 0.5) * average))
              )
        dailyCounts.push(take)
        remaining -= take
      }

      const loopDays = isCustomRange ? 1 : Math.max(1, days || 1)
      const dailyCountsFinal = isCustomRange ? [total] : dailyCounts
      const dayPhaseTotal = isCustomRange ? 0 : loopDays
      const baseDate = !isCustomRange
        ? new Date(
            Number.parseInt(startDate.split('-')[0] || '0', 10),
            Number.parseInt(startDate.split('-')[1] || '1', 10) - 1,
            Number.parseInt(startDate.split('-')[2] || '1', 10)
          )
        : null

      let lastUiUpdate = 0
      const syncProgressUi = (force = false) => {
        const now = Date.now()
        if (!force && now - lastUiUpdate < 400) return
        lastUiUpdate = now
        progress.current = success + errorCount
        progress.success = success
        progress.error = errorCount
      }

      for (let d = 0; d < loopDays; d++) {
        const date = baseDate ? new Date(baseDate) : null
        if (date) date.setDate(baseDate!.getDate() - d)
        const dateStr = date ? formatCalendarDay(date) : ''
        const count = dailyCountsFinal[d] ?? 0

        if (isCustomRange) {
          setPhaseLabel('自訂時間區間')
        } else if (days === 0) {
          setPhaseLabel('執行當下')
        } else if (dayPhaseTotal > 1) {
          setPhaseLabel(`第 ${d + 1} / ${dayPhaseTotal} 天 · ${dateStr}`)
          pushLog(
            'info',
            `第 ${d + 1} / ${dayPhaseTotal} 天 · ${dateStr} · ${formatCount(count)} 筆`
          )
        } else if (dateStr) {
          setPhaseLabel(dateStr)
        }

        for (let i = 0; i < count; i++) {
          try {
            const forcedCard = cardPool
              ? cardPool[Math.floor(Math.random() * cardPool.length)]
              : undefined
            if (!formApi.generateRandomFields(forcedCard)) {
              throw new Error('隨機欄位生成失敗')
            }
            const data = { ...formApi.getFormData() }
            if (isBatchErrorMixEnabled(data)) {
              const pct = getBatchErrorMixPercent(data)
              if (Math.random() * 100 < pct) {
                applyErrorPresetToFormData(data, pickRandomBatchErrorPreset(formApi.form.mode))
              } else {
                applyErrorPresetToFormData(data, PRESET_NO_ERROR)
              }
            }
            if (formApi.form.mode === 'acs' && data.enableAuthenticationMethodRandom === 'on') {
              applyChallengeVerificationMix(data)
            }
            if (date) data.currentDate = dateStr

            const indexBase = resolveIndexName(formApi.form.mode)
            const sharedTs = generateSharedTimestamp(data)
            const built = buildTestDataDocument(data, indexBase, sharedTs)
            bulkLines.push(
              JSON.stringify({ index: { _index: built.fullIndex } }),
              JSON.stringify(built.document)
            )
            bulkRecords.push({ itemCount: 1, dateStr })
            if (bulkRecords.length >= BULK_RECORD_LIMIT) await flushBulk()
          } catch {
            errorCount++
            const scope = dateStr || '自訂區間'
            errorDetails.push(`${scope}：產生或索引失敗`)
            syncProgressUi(true)
          }
        }
        syncProgressUi(true)
      }

      await flushBulk(true)
      await Promise.all([...inFlight])

      syncProgressUi(true)
      progress.finished = true
      setPhaseLabel('')
      progress.errors = errorDetails
      if (errorDetails.length) {
        errorDetails.slice(0, 20).forEach((e) => pushLog('error', e))
      }
      pushLog(
        errorCount === 0 ? 'success' : success > 0 ? 'warning' : 'error',
        `完成 ${formatCount(success)} / ${formatCount(total)}${errorCount > 0 ? `，失敗 ${formatCount(errorCount)}` : ''}`
      )

      if (errorCount === 0) {
        formApi.setStatus(`批量完成，成功 ${success}/${total}`, 'success')
      } else if (success === 0) {
        formApi.setStatus(`批量失敗，全部失敗 ${errorCount}/${total}`, 'error')
      } else {
        formApi.setStatus(`部分成功：成功 ${success}，失敗 ${errorCount}`, 'warning')
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      formApi.setStatus(`批量處理異常: ${msg}`, 'error')
      pushLog('error', msg)
    } finally {
      posting.value = false
      stopProgressTimer()
    }
  }

  return {
    posting,
    progress,
    insertOne,
    batchInsert,
    closeProgress
  }
}
