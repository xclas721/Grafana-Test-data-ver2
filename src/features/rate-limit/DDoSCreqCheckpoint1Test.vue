<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Button, Card, Input, Select } from '@/shared/components'
import DDoSSection from './components/DDoSSection.vue'
import DDoSTestIntro from './components/DDoSTestIntro.vue'
import {
  buildAReqBody,
  buildCReqFormBody,
  generateUUID,
  rewriteUrlForProxy
} from '@/shared/utils/ddos-utils'
import { useApiConfigStore } from '@/stores/apiConfig'
import { LABELS, SECTION_TITLES, BUTTONS, CARD_TITLES, STAT_LABELS, PLACEHOLDER } from './constants'

const apiConfig = useApiConfigStore()
const config = reactive({
  cardScheme: 'V',
  version: '2.2.0',
  issuerOid: '06b4b203-da05-73f9-256f-454929df6076',
  projectId: '001',
  requestCount: 15,
  acctNumber: '4143520000000123',
  merchantId: '8909191',
  merchantName: 'HiTRUST EMV Demo Merchant',
  mcc: '5661',
  merchantCountryCode: '156'
})

const cardSchemeOptions = [
  { value: 'V', label: 'Visa (V)' },
  { value: 'M', label: 'Mastercard (M)' },
  { value: 'J', label: 'JCB (J)' }
]

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
  config.cardScheme = 'V'
  config.version = '2.2.0'
  config.issuerOid = '06b4b203-da05-73f9-256f-454929df6076'
  config.projectId = '001'
  config.requestCount = 15
  config.acctNumber = '4143520000000123'
  config.merchantId = '8909191'
  config.merchantName = 'HiTRUST EMV Demo Merchant'
  config.mcc = '5661'
  config.merchantCountryCode = '156'
}

async function runTest() {
  if (isTesting.value) return
  stats.successCount = 0
  stats.rateLimitCount = 0
  stats.otherErrorCount = 0
  firstBlockedAt.value = null
  logs.value = []
  shouldStop.value = false
  isTesting.value = true

  const areqPath = `/acs-auth/auth/${config.cardScheme}/${config.version}/${config.issuerOid}/${config.projectId}/areq`
  const areqUrl = apiConfig.resolveAcsAuthPath(areqPath)

  addLog('info', '=== CReq Checkpoint1 Rate Limit Test ===')
  addLog('info', 'Step1: AReq create transaction')

  let acsTransID: string
  let creqUrl: string

  try {
    const areqBody = JSON.stringify(
      buildAReqBody({
        cardNumber: config.acctNumber,
        merchantId: config.merchantId,
        merchantName: config.merchantName,
        mcc: config.mcc,
        merchantCountryCode: config.merchantCountryCode
      })
    )
    const areqRes = await fetch(areqUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: areqBody
    })
    const areqData = await areqRes.json()
    if (!areqData.acsTransID || !areqData.acsURL) {
      throw new Error('AReq response missing acsTransID or acsURL')
    }
    acsTransID = areqData.acsTransID
    creqUrl = rewriteUrlForProxy(areqData.acsURL)

    addLog('info', `acsTransID: ${acsTransID}`)
    addLog('info', `creqUrl: ${creqUrl}`)
    addLog('info', `Step2: send ${config.requestCount} CReq requests`)
    addLog('info', 'Expected: once blocked, stays blocked')
    addLog('info', '')
  } catch (e: unknown) {
    addLog('error', `AReq failed: ${e instanceof Error ? e.message : 'Unknown'}`)
    isTesting.value = false
    return
  }

  for (let i = 1; i <= config.requestCount; i++) {
    if (shouldStop.value) break
    const body = buildCReqFormBody(acsTransID)
    const start = Date.now()
    try {
      const res = await fetch(creqUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      })
      const ms = Date.now() - start
      const text = await res.text()

      if (!text || text.trim() === '') {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (${ms}ms)`)
      } else if (res.status === 403) {
        stats.rateLimitCount++
        if (!firstBlockedAt.value) firstBlockedAt.value = i
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (HTTP 403, ${ms}ms)`)
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
  addLog('info', `PASS: ${stats.successCount}`)
  addLog('info', `BLOCKED: ${stats.rateLimitCount}`)
  addLog('info', `ERROR: ${stats.otherErrorCount}`)
  addLog('info', `First blocked at: ${firstBlockedAt.value ?? 'N/A'}`)
  if (firstBlockedAt.value && stats.rateLimitCount >= 2 && stats.otherErrorCount === 0) {
    addLog('success', 'Result: PASS')
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
      <li>CReq 檢查點1</li>
    </ul>
  </div>

  <DDoSTestIntro test-type="creqCheckpoint1" class="mb-6" />

  <Card :title="CARD_TITLES.config" subtitle="CReq 檢查點1 - 進入限流後持續限流">
    <div class="space-y-4">
      <DDoSSection :title="SECTION_TITLES.connection">
        <Select
          v-model="config.cardScheme"
          :label="LABELS.cardScheme"
          :options="cardSchemeOptions"
          :disabled="isTesting"
        />
        <Input
          v-model="config.version"
          :label="LABELS.version"
          placeholder="2.2.0"
          :disabled="isTesting"
        />
        <Input
          v-model="config.issuerOid"
          :label="LABELS.issuerOid"
          placeholder="UUID"
          :disabled="isTesting"
        />
        <Input
          v-model="config.projectId"
          :label="LABELS.projectId"
          placeholder="001"
          :disabled="isTesting"
        />
      </DDoSSection>

      <DDoSSection :title="SECTION_TITLES.merchantForAreq">
        <Input
          v-model="config.merchantId"
          :label="LABELS.merchantId"
          placeholder="8909191"
          :disabled="isTesting"
        />
        <Input
          v-model="config.merchantName"
          :label="LABELS.merchantName"
          placeholder="HiTRUST EMV Demo Merchant"
          :disabled="isTesting"
        />
        <Input v-model="config.mcc" :label="LABELS.mcc" placeholder="5661" :disabled="isTesting" />
        <Input
          v-model="config.merchantCountryCode"
          :label="LABELS.merchantCountryCode"
          placeholder="156"
          :disabled="isTesting"
        />
      </DDoSSection>

      <DDoSSection :title="SECTION_TITLES.request">
        <Input
          v-model="config.acctNumber"
          :label="LABELS.acctNumber"
          placeholder="4143520000000123"
          :disabled="isTesting"
        />
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
      </div>
      <div class="stat bg-error/10 rounded-lg p-4">
        <div class="stat-title text-xs">{{ STAT_LABELS.blocked }}</div>
        <div class="stat-value text-2xl text-error">{{ stats.rateLimitCount }}</div>
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
