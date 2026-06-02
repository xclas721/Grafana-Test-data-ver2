<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { Button, Card, Input, ParamInput, Select } from '@/shared/components'
import DDoSSection from './components/DDoSSection.vue'
import DDoSTestIntro from './components/DDoSTestIntro.vue'
import { buildAReqBody, generateUUID } from '@/shared/utils/ddos-utils'
import { useApiConfigStore } from '@/stores/apiConfig'
import { LABELS, SECTION_TITLES, BUTTONS, CARD_TITLES, STAT_LABELS, PLACEHOLDER } from './constants'

const apiConfig = useApiConfigStore()
const config = reactive({
  cardScheme: 'V',
  version: '2.2.0',
  issuerOid: '06b4b203-da05-73f9-256f-454929df6076',
  issuerOidRandom: false,
  projectId: '001',
  merchantId: '8909191',
  merchantName: 'HiTRUST EMV Demo Merchant',
  mcc: '5661',
  merchantCountryCode: '156',
  acquirerBIN: '1231234',
  purchaseAmount: '100',
  purchaseCurrency: '156',
  purchaseExponent: '2',
  requestCount: 380,
  cardPoolSize: 120,
  cardPrefix: '414352000000'
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
  config.merchantId = '8909191'
  config.merchantName = 'HiTRUST EMV Demo Merchant'
  config.mcc = '5661'
  config.merchantCountryCode = '156'
  config.acquirerBIN = '1231234'
  config.purchaseAmount = '100'
  config.purchaseCurrency = '156'
  config.purchaseExponent = '2'
  config.requestCount = 380
  config.cardPoolSize = 120
  config.cardPrefix = '414352000000'
}

function getIssuerOid() {
  return config.issuerOidRandom ? generateUUID() : config.issuerOid
}

async function runTest() {
  if (isTesting.value) return
  stats.successCount = 0
  stats.rateLimitCount = 0
  stats.otherErrorCount = 0
  logs.value = []
  shouldStop.value = false
  isTesting.value = true

  const issuerOid = getIssuerOid()
  const path = `/acs-auth/auth/${config.cardScheme}/${config.version}/${issuerOid}/${config.projectId}/areq`
  const url = apiConfig.resolveAcsAuthPath(path)

  const cards = Array.from(
    { length: config.cardPoolSize },
    (_, i) => config.cardPrefix + i.toString().padStart(4, '0')
  )

  addLog('info', `=== AReq Merchant Rate Limit Test ===`)
  addLog('info', `URL: ${url}`)
  addLog('info', `MerchantId: ${config.merchantId}, RequestCount: ${config.requestCount}`)
  addLog('info', `Expected: first 360 pass, 361st+ blocked`)
  addLog('info', '')

  for (let i = 1; i <= config.requestCount; i++) {
    if (shouldStop.value) break
    const cardNumber = cards[(i - 1) % cards.length] ?? config.cardPrefix + '0000'
    const body = JSON.stringify(
      buildAReqBody({
        cardNumber,
        merchantId: config.merchantId || '8909191',
        merchantName: config.merchantName,
        mcc: config.mcc,
        merchantCountryCode: config.merchantCountryCode,
        acquirerBIN: config.acquirerBIN,
        purchaseAmount: config.purchaseAmount,
        purchaseCurrency: config.purchaseCurrency,
        purchaseExponent: config.purchaseExponent
      })
    )
    const start = Date.now()
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body
      })
      const ms = Date.now() - start
      const data = await res.json().catch(() => null)

      if (data?.messageType === 'ARes') {
        stats.successCount++
        if (i % 50 === 0) addLog('success', `[${i}/${config.requestCount}] PASS (${ms}ms)`)
      } else if (data?.errorCode === '403' || res.status === 403) {
        stats.rateLimitCount++
        addLog('error', `[${i}/${config.requestCount}] BLOCKED (${ms}ms)`)
      } else {
        stats.otherErrorCount++
        addLog(
          'error',
          `[${i}/${config.requestCount}] ERROR: ${data?.errorCode || res.status} (${ms}ms)`
        )
      }
    } catch (e: unknown) {
      const ms = Date.now() - start
      stats.otherErrorCount++
      addLog(
        'error',
        `[${i}/${config.requestCount}] ERROR: ${e instanceof Error ? e.message : 'Unknown'} (${ms}ms)`
      )
    }

    if (i % 50 === 0 && i < config.requestCount) {
      addLog(
        'info',
        `[Progress] ${i}/${config.requestCount} | PASS=${stats.successCount} BLOCKED=${stats.rateLimitCount} ERR=${stats.otherErrorCount}`
      )
    }
  }

  const expectedBlocked = Math.max(0, config.requestCount - 360)
  addLog('info', '')
  addLog('info', `=== Summary ===`)
  addLog('info', `PASS: ${stats.successCount} (expected: 360)`)
  addLog('info', `BLOCKED: ${stats.rateLimitCount} (expected >= ${expectedBlocked})`)
  addLog('info', `ERROR: ${stats.otherErrorCount}`)
  if (stats.rateLimitCount >= expectedBlocked && stats.otherErrorCount === 0) {
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

const expectedBlocked = computed(() => Math.max(0, config.requestCount - 360))
</script>

<template>
  <DDoSTestIntro test-type="areqMerchant" class="mb-6" />

  <Card :title="CARD_TITLES.config" subtitle="AReq 商戶限流 - 前 360 次通過，第 361 次起限流">
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
        <ParamInput
          v-model="config.issuerOid"
          :label="LABELS.issuerOid"
          placeholder="UUID"
          :randomizable="true"
          :use-random="config.issuerOidRandom"
          @update:use-random="config.issuerOidRandom = $event"
          :disabled="isTesting"
        />
        <Input
          v-model="config.projectId"
          :label="LABELS.projectId"
          placeholder="001"
          :disabled="isTesting"
        />
      </DDoSSection>

      <DDoSSection :title="SECTION_TITLES.merchant">
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
        <Input
          v-model="config.acquirerBIN"
          :label="LABELS.acquirerBin"
          placeholder="1231234"
          :disabled="isTesting"
        />
      </DDoSSection>

      <DDoSSection :title="SECTION_TITLES.transaction">
        <Input
          v-model="config.purchaseAmount"
          :label="LABELS.purchaseAmount"
          placeholder="100"
          :disabled="isTesting"
        />
        <Input
          v-model="config.purchaseCurrency"
          :label="LABELS.purchaseCurrency"
          placeholder="156"
          :disabled="isTesting"
        />
        <Input
          v-model="config.purchaseExponent"
          :label="LABELS.purchaseExponent"
          placeholder="2"
          :disabled="isTesting"
        />
      </DDoSSection>

      <DDoSSection :title="SECTION_TITLES.cardAndRequest">
        <Input
          v-model="config.cardPrefix"
          :label="LABELS.cardPrefix"
          placeholder="414352000000"
          :disabled="isTesting"
        />
        <div class="form-control">
          <label class="label"
            ><span class="label-text">{{ LABELS.cardPoolSize }}</span></label
          >
          <input
            v-model.number="config.cardPoolSize"
            type="number"
            min="1"
            max="500"
            class="input input-bordered input-sm w-full"
            :disabled="isTesting"
          />
        </div>
        <div class="form-control">
          <label class="label"
            ><span class="label-text">{{ LABELS.requestCount }}</span></label
          >
          <input
            v-model.number="config.requestCount"
            type="number"
            min="1"
            max="500"
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
        <div class="stat-desc text-xs">預期: 360</div>
      </div>
      <div class="stat bg-error/10 rounded-lg p-4">
        <div class="stat-title text-xs">{{ STAT_LABELS.blocked }}</div>
        <div class="stat-value text-2xl text-error">{{ stats.rateLimitCount }}</div>
        <div class="stat-desc text-xs">預期 >= {{ expectedBlocked }}</div>
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
