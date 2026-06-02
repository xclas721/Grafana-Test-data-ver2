<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, Card, Input, ParamInput } from '@/shared/components'
import DDoSSection from './components/DDoSSection.vue'
import DDoSTestIntro from './components/DDoSTestIntro.vue'
import { build3DSMethodFormData, generateUUID } from '@/shared/utils/ddos-utils'
import { useApiConfigStore } from '@/stores/apiConfig'
import { LABELS, SECTION_TITLES, BUTTONS, CARD_TITLES, STAT_LABELS, PLACEHOLDER } from './constants'

const apiConfig = useApiConfigStore()
const config = reactive({
  requestCount: 10,
  threeDSServerTransID: '',
  threeDSServerTransIDRandom: true,
  threeDSMethodNotificationURL: 'http://localhost:8040/3dsmethod/notify',
  /** 必填。請求 path 為 /3dsmethod/{issuerOid}/collect */
  issuerOid: '06b4b203-da05-73f9-256f-454929df6076'
})

const isTesting = ref(false)
const shouldStop = ref(false)

const stats = reactive({
  successCount: 0,
  rateLimitCount: 0,
  otherErrorCount: 0
})
const firstBlockedAt = ref<number | null>(null)

interface LogEntry {
  id: string
  time: string
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
}
const logs = ref<LogEntry[]>([])

function addLog(type: LogEntry['type'], message: string) {
  logs.value.push({
    id: generateUUID(),
    time: new Date().toLocaleTimeString('zh-TW'),
    type,
    message
  })
  setTimeout(() => document.getElementById('log-container')?.scrollTo({ top: 1e9 }), 10)
}

function getLogClass(type: LogEntry['type']) {
  return {
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
    info: 'text-info'
  }[type]
}

function loadDefaults() {
  config.requestCount = 10
  config.threeDSServerTransIDRandom = true
  config.threeDSMethodNotificationURL = 'http://localhost:8040/3dsmethod/notify'
  config.issuerOid = '06b4b203-da05-73f9-256f-454929df6076'
}

function getThreeDSServerTransID() {
  return config.threeDSServerTransIDRandom ? generateUUID() : config.threeDSServerTransID
}

async function runTest() {
  if (isTesting.value) return
  const issuerOid = config.issuerOid?.trim()
  if (!issuerOid) {
    logs.value = []
    addLog('error', '請填寫 Issuer OID')
    return
  }
  stats.successCount = 0
  stats.rateLimitCount = 0
  stats.otherErrorCount = 0
  firstBlockedAt.value = null
  logs.value = []
  shouldStop.value = false
  isTesting.value = true

  const threeDSServerTransID = getThreeDSServerTransID()
  const path = `/acs-auth-web/3dsmethod/${encodeURIComponent(issuerOid)}/collect`
  const url = apiConfig.resolveAcsAuthWebPath(path)

  const formData = build3DSMethodFormData(threeDSServerTransID, config.threeDSMethodNotificationURL)

  addLog('info', '=== 3DS Method Rate Limit Test ===')
  addLog('info', `URL: ${url}`)
  addLog('info', `Same threeDSServerTransID, RequestCount=${config.requestCount}`)
  addLog('info', `threeDSServerTransID: ${threeDSServerTransID}`)
  addLog('info', `issuerOid: ${issuerOid}`)
  addLog('info', 'Expected: first 5 pass, 6th+ blocked')
  addLog('info', '')

  for (let i = 1; i <= config.requestCount; i++) {
    if (shouldStop.value) break
    const start = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData
      })
      const ms = Date.now() - start
      const text = await res.text()

      if (!text || text.trim() === '') {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (empty, ${ms}ms)`)
      } else if (/error_3dsmethod|DDoS|Invalid ACS/.test(text)) {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (error page, ${ms}ms)`)
      } else if (res.status === 403) {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (HTTP 403, ${ms}ms)`)
      } else if (res.status >= 400) {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (HTTP ${res.status}, ${ms}ms)`)
      } else {
        stats.successCount++
        addLog('success', `[${i}/${config.requestCount}] PASS (${ms}ms)`)
      }
    } catch (e: unknown) {
      const ms = Date.now() - start
      stats.otherErrorCount++
      addLog(
        'error',
        `[${i}/${config.requestCount}] ERROR: ${e instanceof Error ? e.message : 'Unknown'} (${ms}ms)`
      )
    }
  }

  addLog('info', '')
  addLog('info', `=== Summary ===`)
  addLog('info', `threeDSServerTransID: ${threeDSServerTransID}`)
  addLog('info', `PASS: ${stats.successCount} (expected: 5)`)
  addLog('info', `BLOCKED: ${stats.rateLimitCount} (expected >= 5)`)
  addLog('info', `ERROR: ${stats.otherErrorCount}`)
  addLog('info', `First blocked at: ${firstBlockedAt.value ?? 'N/A'}`)
  if (
    firstBlockedAt.value &&
    firstBlockedAt.value >= 6 &&
    stats.rateLimitCount >= 2 &&
    stats.otherErrorCount === 0
  ) {
    addLog('success', 'Result: PASS (rate limit triggered as expected)')
  } else if (firstBlockedAt.value && stats.rateLimitCount >= 1 && stats.otherErrorCount === 0) {
    addLog('success', 'Result: PASS (at least one blocked)')
  } else {
    addLog('warning', 'Result: CHECK LOGS')
  }

  isTesting.value = false
  shouldStop.value = false
}

function stopTest() {
  shouldStop.value = true
}
</script>

<template>
  <div class="text-xs breadcrumbs text-base-content/60 mb-4">
    <ul>
      <li>工具</li>
      <li>DDoS 限流測試</li>
      <li>3DS Method 限流</li>
    </ul>
  </div>

  <DDoSTestIntro test-type="threeDSMethod" class="mb-6" />

  <Card :title="CARD_TITLES.config" subtitle="3DS Method - 前 5 次通過，第 6 次起限流">
    <div class="space-y-4">
      <DDoSSection :title="SECTION_TITLES.request">
        <div class="form-control">
          <label class="label"
            ><span class="label-text">{{ LABELS.requestCount }}</span></label
          >
          <input
            v-model.number="config.requestCount"
            type="number"
            min="1"
            max="100"
            class="input input-bordered input-sm w-full"
            :disabled="isTesting"
          />
        </div>
        <ParamInput
          v-model="config.threeDSServerTransID"
          :label="LABELS.threeDSServerTransID"
          placeholder="UUID"
          :randomizable="true"
          :use-random="config.threeDSServerTransIDRandom"
          @update:use-random="config.threeDSServerTransIDRandom = $event"
          :disabled="isTesting"
        />
        <Input
          v-model="config.issuerOid"
          :label="LABELS.issuerOid"
          placeholder="必填，與其他 DDoS 測試相同發卡行 OID"
          :disabled="isTesting"
        />
        <Input
          v-model="config.threeDSMethodNotificationURL"
          :label="LABELS.threeDSMethodNotificationURL"
          placeholder="http://localhost:8040/3dsmethod/notify"
          :disabled="isTesting"
        />
      </DDoSSection>
    </div>
    <div class="flex gap-2 mt-6">
      <Button variant="outline" @click="loadDefaults" :disabled="isTesting">{{
        BUTTONS.loadDefaults
      }}</Button>
      <Button
        v-if="!isTesting"
        variant="success"
        @click="runTest"
        :disabled="isTesting"
        :loading="isTesting"
      >
        {{ BUTTONS.startTest }}
      </Button>
      <Button v-else variant="danger" @click="stopTest">{{ BUTTONS.stopTest }}</Button>
    </div>
  </Card>

  <Card :title="CARD_TITLES.summary" class="mt-6">
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div class="stat bg-success/10 rounded-lg p-4">
        <div class="stat-title text-xs">{{ STAT_LABELS.pass }}</div>
        <div class="stat-value text-2xl text-success">{{ stats.successCount }}</div>
        <div class="stat-desc text-xs">預期: 5</div>
      </div>
      <div class="stat bg-error/10 rounded-lg p-4">
        <div class="stat-title text-xs">{{ STAT_LABELS.blocked }}</div>
        <div class="stat-value text-2xl text-error">{{ stats.rateLimitCount }}</div>
        <div class="stat-desc text-xs">預期 >= 5</div>
      </div>
      <div class="stat bg-warning/10 rounded-lg p-4">
        <div class="stat-title text-xs">{{ STAT_LABELS.error }}</div>
        <div class="stat-value text-2xl text-warning">{{ stats.otherErrorCount }}</div>
      </div>
    </div>
  </Card>

  <Card :title="CARD_TITLES.log" :subtitle="CARD_TITLES.logSubtitle" class="mt-6">
    <div
      id="log-container"
      class="bg-base-300 rounded-lg p-4 max-h-[500px] overflow-y-auto font-mono text-xs space-y-1"
    >
      <div
        v-for="log in logs"
        :key="log.id"
        :class="['whitespace-pre-wrap', getLogClass(log.type)]"
      >
        <span class="text-base-content/60">[{{ log.time }}]</span>
        {{ log.message }}
      </div>
      <div v-if="!logs.length" class="text-base-content/40 text-center py-8">
        {{ PLACEHOLDER.noTestYet }}
      </div>
    </div>
  </Card>
</template>
