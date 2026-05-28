<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { Button, Card, PageHeader } from '@/shared/components'
import { computeExpectedRates, rollRandomStatuses } from '@/composables/useTransactionStatusRules'

const form = reactive({
  mode: 'acs' as 'acs' | 'dss',
  stateMachineReasonMode: 'random' as 'random' | 'fixed',
  stateMachineReason: 'NULL_VALUE',
  aresWeightY: '6',
  aresWeightN: '4',
  aresWeightR: '3',
  aresWeightC: '84',
  aresWeightD: '0',
  aresWeightA: '0',
  aresWeightI: '1',
  aresWeightS: '0',
  aresWeightU: '2',
  rreqWeightNull: '5',
  rreqWeightY: '86',
  rreqWeightN: '9'
})

const lastResult = ref<{
  aresTransStatus: string
  rreqTransStatus: string
  transStatus: string
  stateMachineReason: string
} | null>(null)

const rates = computed(() => computeExpectedRates(form))

function generateOne() {
  lastResult.value = rollRandomStatuses({
    activeMode: form.mode,
    stateMachineReasonMode: form.stateMachineReasonMode,
    stateMachineReason: form.stateMachineReason,
    aresWeightY: form.aresWeightY,
    aresWeightN: form.aresWeightN,
    aresWeightR: form.aresWeightR,
    aresWeightC: form.aresWeightC,
    aresWeightD: form.aresWeightD,
    aresWeightA: form.aresWeightA,
    aresWeightI: form.aresWeightI,
    aresWeightS: form.aresWeightS,
    aresWeightU: form.aresWeightU,
    rreqWeightNull: form.rreqWeightNull,
    rreqWeightY: form.rreqWeightY,
    rreqWeightN: form.rreqWeightN
  })
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader
      title="Test Data Input"
      subtitle="第一批遷移：先落地隨機規則核心與可運行頁面骨架。"
    />
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="目前狀態" subtitle="此頁先驗證核心規則已遷移到 Grafana-Test-data-ver2">
        <ul class="list-disc list-inside text-sm text-base-content/80 space-y-1">
          <li>已遷移 transaction/business/device/timing 四組 composables</li>
          <li>已加入對應單元測試（Vitest）</li>
          <li>後續將補齊完整 TestInput UI 與資料送出流程</li>
        </ul>
      </Card>
      <Card title="快速驗證" subtitle="按下按鈕產生一筆狀態，確認規則可用">
        <div class="space-y-2 text-sm">
          <div>交易成功率（預估）：{{ rates.expectedTransactionSuccessRate.toFixed(2) }}%</div>
          <div>免密驗證率（預估）：{{ rates.expectedFrictionlessRate.toFixed(2) }}%</div>
          <div>挑戰成功率（預估）：{{ rates.expectedChallengeSuccessRate.toFixed(2) }}%</div>
        </div>
        <div class="mt-4">
          <Button variant="primary" @click="generateOne">生成一筆樣本</Button>
        </div>
        <pre v-if="lastResult" class="mt-4 text-xs bg-base-200 p-3 rounded overflow-auto">{{
          JSON.stringify(lastResult, null, 2)
        }}</pre>
      </Card>
    </div>
  </div>
</template>
