<script setup lang="ts">
import { computed } from 'vue'
import { Card, Input, Select, type SelectOption } from '@/shared/components'
import {
  defaultStateMachineReason,
  getStateMachineReasonOptions,
  type ProductMode
} from '@/shared/constants/stateMachineReason'

const props = defineProps<{
  /** 產品模式：3DSS 時狀態機原因僅顯示 S 前綴代碼 */
  activeMode?: ProductMode
  aresTransStatus: string
  transStatus: string
  rreqTransStatus: string
  transStatusReason: string
  stateMachineReason: string
  challengeCancel: string
  transStatusReasonMode: 'random' | 'fixed'
  stateMachineReasonMode: 'random' | 'fixed'
  disableRreqTransStatus: boolean
  disableTransStatusReason: boolean
  disableStateMachineReason: boolean
  disableChallengeCancel: boolean
  aresWeightY: string
  aresWeightN: string
  aresWeightR: string
  aresWeightC: string
  aresWeightD: string
  aresWeightA: string
  aresWeightI: string
  aresWeightS: string
  aresWeightU: string
  rreqWeightNull: string
  rreqWeightY: string
  rreqWeightN: string
  challengeCancelRate: string
  aresWeightTotal: number
  aresWeightUnallocated: number
  rreqWeightTotal: number
  rreqWeightUnallocated: number
  expectedTransactionSuccessRate: number
  expectedFrictionlessRate: number
  expectedChallengeSuccessRate: number
}>()

const emit = defineEmits<{
  'update:aresTransStatus': [value: string]
  'update:transStatus': [value: string]
  'update:rreqTransStatus': [value: string]
  'update:transStatusReason': [value: string]
  'update:stateMachineReason': [value: string]
  'update:transStatusReasonMode': [value: 'random' | 'fixed']
  'update:stateMachineReasonMode': [value: 'random' | 'fixed']
  'update:challengeCancel': [value: string]
  'update:aresWeightY': [value: string]
  'update:aresWeightN': [value: string]
  'update:aresWeightR': [value: string]
  'update:aresWeightC': [value: string]
  'update:aresWeightD': [value: string]
  'update:aresWeightA': [value: string]
  'update:aresWeightI': [value: string]
  'update:aresWeightS': [value: string]
  'update:aresWeightU': [value: string]
  'update:rreqWeightNull': [value: string]
  'update:rreqWeightY': [value: string]
  'update:rreqWeightN': [value: string]
  'update:challengeCancelRate': [value: string]
}>()

const getAresWeight = (key: string): number => {
  switch (key) {
    case 'aresWeightY':
      return Number(props.aresWeightY) || 0
    case 'aresWeightN':
      return Number(props.aresWeightN) || 0
    case 'aresWeightR':
      return Number(props.aresWeightR) || 0
    case 'aresWeightC':
      return Number(props.aresWeightC) || 0
    case 'aresWeightD':
      return Number(props.aresWeightD) || 0
    case 'aresWeightA':
      return Number(props.aresWeightA) || 0
    case 'aresWeightI':
      return Number(props.aresWeightI) || 0
    case 'aresWeightS':
      return Number(props.aresWeightS) || 0
    case 'aresWeightU':
      return Number(props.aresWeightU) || 0
    default:
      return 0
  }
}

const onAresWeightInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  let nextValue = Number(target.value) || 0
  if (nextValue < 0) nextValue = 0
  if (nextValue > 100) nextValue = 100
  const currentValue = getAresWeight(key)
  const baseTotal = props.aresWeightTotal - currentValue
  if (baseTotal + nextValue > 100) {
    nextValue = Math.max(0, 100 - baseTotal)
  }
  if (target.value !== String(nextValue)) {
    target.value = String(nextValue)
  }
  switch (key) {
    case 'aresWeightY':
      emit('update:aresWeightY', String(nextValue))
      break
    case 'aresWeightN':
      emit('update:aresWeightN', String(nextValue))
      break
    case 'aresWeightR':
      emit('update:aresWeightR', String(nextValue))
      break
    case 'aresWeightC':
      emit('update:aresWeightC', String(nextValue))
      break
    case 'aresWeightD':
      emit('update:aresWeightD', String(nextValue))
      break
    case 'aresWeightA':
      emit('update:aresWeightA', String(nextValue))
      break
    case 'aresWeightI':
      emit('update:aresWeightI', String(nextValue))
      break
    case 'aresWeightS':
      emit('update:aresWeightS', String(nextValue))
      break
    case 'aresWeightU':
      emit('update:aresWeightU', String(nextValue))
      break
  }
}

const getRreqWeight = (key: string): number => {
  switch (key) {
    case 'rreqWeightNull':
      return Number(props.rreqWeightNull) || 0
    case 'rreqWeightY':
      return Number(props.rreqWeightY) || 0
    case 'rreqWeightN':
      return Number(props.rreqWeightN) || 0
    default:
      return 0
  }
}

const onRreqWeightInput = (key: string, event: Event) => {
  const target = event.target as HTMLInputElement
  let nextValue = Number(target.value) || 0
  if (nextValue < 0) nextValue = 0
  if (nextValue > 100) nextValue = 100
  const currentValue = getRreqWeight(key)
  const baseTotal = props.rreqWeightTotal - currentValue
  if (baseTotal + nextValue > 100) {
    nextValue = Math.max(0, 100 - baseTotal)
  }
  if (target.value !== String(nextValue)) {
    target.value = String(nextValue)
  }
  switch (key) {
    case 'rreqWeightNull':
      emit('update:rreqWeightNull', String(nextValue))
      break
    case 'rreqWeightY':
      emit('update:rreqWeightY', String(nextValue))
      break
    case 'rreqWeightN':
      emit('update:rreqWeightN', String(nextValue))
      break
  }
}

const onReasonModeChange = (
  key: 'transStatusReasonMode' | 'stateMachineReasonMode',
  value: string
) => {
  const mode = value === 'fixed' ? 'fixed' : 'random'
  if (key === 'transStatusReasonMode') {
    emit('update:transStatusReasonMode', mode)
    if (mode === 'random') emit('update:transStatusReason', 'NULL_VALUE')
  } else {
    emit('update:stateMachineReasonMode', mode)
    if (mode === 'random') emit('update:stateMachineReason', 'NULL_VALUE')
  }
}

const onReasonValueChange = (key: 'transStatusReason' | 'stateMachineReason', value: string) => {
  if (key === 'transStatusReason') {
    emit('update:transStatusReason', value || 'NULL_VALUE')
    emit('update:transStatusReasonMode', 'fixed')
  } else {
    emit('update:stateMachineReason', value || defaultStateMachineReason(props.activeMode))
    emit('update:stateMachineReasonMode', 'fixed')
  }
}

const stateMachineReasonOptions = computed(() => getStateMachineReasonOptions(props.activeMode))

const aresOptions: SelectOption[] = [
  { value: 'Y', label: 'Y' },
  { value: 'N', label: 'N' },
  { value: 'C', label: 'C' },
  { value: 'D', label: 'D' },
  { value: 'R', label: 'R' },
  { value: 'A', label: 'A' },
  { value: 'I', label: 'I' },
  { value: 'S', label: 'S' },
  { value: 'U', label: 'U' }
]

const rreqOptions: SelectOption[] = [
  { value: 'NULL_VALUE', label: 'NULL_VALUE' },
  { value: 'Y', label: 'Y - 認證成功' },
  { value: 'N', label: 'N - 認證失敗' }
]

const transStatusReasonOptions: SelectOption[] = [
  { value: 'NULL_VALUE', label: 'NULL_VALUE' },
  { value: '01', label: '01 - Card authentication failed' },
  { value: '02', label: '02 - Unknown device' },
  { value: '03', label: '03 - Unsupported device' },
  { value: '04', label: '04 - Exceeds authentication frequency limit' },
  { value: '05', label: '05 - Expired card' },
  { value: '06', label: '06 - Invalid card number' },
  { value: '07', label: '07 - Invalid transaction' },
  { value: '08', label: '08 - No card record' },
  { value: '09', label: '09 - Security failure' },
  { value: '10', label: '10 - Stolen card' },
  { value: '11', label: '11 - Suspected fraud' },
  { value: '12', label: '12 - Transaction not permitted to Cardholder' },
  { value: '13', label: '13 - Cardholder not enrolled in service' },
  { value: '14', label: '14 - Transaction timed out at the ACS' },
  { value: '15', label: '15 - Low confidence' },
  { value: '16', label: '16 - Medium confidence' },
  { value: '17', label: '17 - High confidence' },
  { value: '18', label: '18 - Very high confidence' },
  { value: '19', label: '19 - Exceeds ACS maximum challenges' },
  { value: '20', label: '20 - Non-Payment transaction not supported' },
  { value: '21', label: '21 - 3RI transaction not supported' },
  { value: '22', label: '22 - ACS technical issue' },
  {
    value: '23',
    label: '23 - Decoupled Authentication required by ACS but not requested by 3DS Requestor'
  },
  { value: '24', label: '24 - 3DS Requestor Decoupled Max Expiry Time exceeded' },
  {
    value: '25',
    label:
      '25 - Decoupled Authentication was provided insufficient time to authenticate Cardholder. ACS will not make attempt'
  },
  { value: '26', label: '26 - Authentication attempted but not performed by the Cardholder' },
  { value: '91', label: '91 - Agree to Visa VPP registration' },
  { value: '92', label: '92 - Do not agree to Visa VPP registration' }
]

const challengeCancelOptions: SelectOption[] = [
  { value: 'NULL_VALUE', label: 'NULL_VALUE (留空)' },
  { value: '01', label: '01 - 持卡人選擇「取消」' },
  { value: '02', label: '02 - 3DS 請求者取消了身份驗證' },
  { value: '03', label: '03 - 交易被放棄 (Decoupled Authentication timeout)' },
  { value: '04', label: '04 - ACS 其他超時的交易超時' },
  { value: '05', label: '05 - ACS 未收到 ACS-First CReq 的事務超時' },
  { value: '06', label: '06 - 交易錯誤' },
  { value: '07', label: '07 - 未知' },
  { value: '09', label: '09 - Error Message in response to the CRes message' },
  { value: '10', label: '10 - Error Message in response to the CReq message' }
]

const reasonModeOptions: SelectOption[] = [
  { value: 'random', label: '全隨機' },
  { value: 'fixed', label: '固定代碼' }
]
</script>

<template>
  <!-- 交易狀態（節錄核心欄位，其餘區塊將續移植） -->
  <section id="transaction-status" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">2.交易狀態</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Select
            id="aresTransStatus"
            label="ARes 交易狀態 (ares_transStatus)"
            :model-value="props.aresTransStatus"
            :options="aresOptions"
            required
            @update:model-value="(value) => emit('update:aresTransStatus', String(value))"
          />
          <p class="text-xs text-error mt-1">可隨機生成</p>
        </div>
        <div>
          <Input
            id="transStatus"
            label="交易狀態 (transStatus)"
            :model-value="props.transStatus"
            required
            @update:model-value="(value) => emit('update:transStatus', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">通常等於 ARes 交易狀態</p>
        </div>
        <div>
          <Select
            id="rreqTransStatus"
            label="RReq 交易狀態 (rreq_transStatus)"
            :model-value="props.rreqTransStatus"
            :options="rreqOptions"
            :disabled="props.disableRreqTransStatus"
            @update:model-value="(value) => emit('update:rreqTransStatus', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">只有當 ARes 狀態為 C/D 時才可選擇</p>
          <p class="text-xs text-error mt-1">可隨機生成</p>
        </div>
        <div>
          <Select
            id="transStatusReason"
            label="交易狀態原因 (transStatusReason)"
            :model-value="props.transStatusReason"
            :options="transStatusReasonOptions"
            :disabled="props.disableTransStatusReason || props.transStatusReasonMode === 'random'"
            @update:model-value="(value) => onReasonValueChange('transStatusReason', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">只有當 ARes 狀態為 R 時才可選擇</p>
          <p class="text-xs text-error mt-1">可隨機生成</p>
        </div>
        <div>
          <Select
            id="stateMachineReason"
            label="狀態機原因 (stateMachineReason)"
            :model-value="props.stateMachineReason"
            :options="stateMachineReasonOptions"
            :disabled="props.disableStateMachineReason || props.stateMachineReasonMode === 'random'"
            @update:model-value="(value) => onReasonValueChange('stateMachineReason', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">只有當 ARes 狀態為 R 時才可選擇</p>
          <p class="text-xs text-error mt-1">可隨機生成</p>
        </div>
        <div>
          <Select
            id="challengeCancel"
            label="挑戰驗證取消指標 (challengeCancel)"
            :model-value="props.challengeCancel"
            :options="challengeCancelOptions"
            :disabled="props.disableChallengeCancel"
            @update:model-value="(value) => emit('update:challengeCancel', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">
            只有當 ARes 狀態為 C 且 RReq 狀態為 N 時才可選擇
          </p>
          <p class="text-xs text-error mt-1">可隨機生成</p>
          <p class="text-xs text-error mt-1">
            Edit 8 監控指標：challengeCancel ≠ null / ARes=C 的放棄率需 ≤ 10%
          </p>
        </div>
      </div>

      <div class="mt-4 rounded-md bg-base-200 p-4">
        <div class="text-sm font-semibold text-base-content/80 mb-3">隨機機率設定</div>
        <div
          class="mt-4 mb-2 rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm font-semibold text-base-content shadow-sm"
        >
          交易成功率：{{ props.expectedTransactionSuccessRate.toFixed(2) }}% ・免密驗證率：{{
            props.expectedFrictionlessRate.toFixed(2)
          }}% ・挑戰驗證成功率：{{ props.expectedChallengeSuccessRate.toFixed(2) }}%
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label class="label">
              <span class="label-text">
                ARes Y 權重% (ares_transStatus=Y)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightY }}%</span>
              </span>
            </label>
            <input
              id="aresWeightY"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightY"
              @input="(event) => onAresWeightInput('aresWeightY', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes A 權重% (ares_transStatus=A)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightA }}%</span>
              </span>
            </label>
            <input
              id="aresWeightA"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightA"
              @input="(event) => onAresWeightInput('aresWeightA', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes I 權重% (ares_transStatus=I)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightI }}%</span>
              </span>
            </label>
            <input
              id="aresWeightI"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightI"
              @input="(event) => onAresWeightInput('aresWeightI', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes C 權重% (ares_transStatus=C)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightC }}%</span>
              </span>
            </label>
            <input
              id="aresWeightC"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightC"
              @input="(event) => onAresWeightInput('aresWeightC', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes D 權重% (ares_transStatus=D)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightD }}%</span>
              </span>
            </label>
            <input
              id="aresWeightD"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightD"
              @input="(event) => onAresWeightInput('aresWeightD', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes S 權重% (ares_transStatus=S)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightS }}%</span>
              </span>
            </label>
            <input
              id="aresWeightS"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightS"
              @input="(event) => onAresWeightInput('aresWeightS', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes N 權重% (ares_transStatus=N)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightN }}%</span>
              </span>
            </label>
            <input
              id="aresWeightN"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightN"
              @input="(event) => onAresWeightInput('aresWeightN', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes R 權重% (ares_transStatus=R)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightR }}%</span>
              </span>
            </label>
            <input
              id="aresWeightR"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightR"
              @input="(event) => onAresWeightInput('aresWeightR', event)"
            />
          </div>
          <div>
            <label class="label">
              <span class="label-text">
                ARes U 權重% (ares_transStatus=U)
                <span class="text-xs text-base-content/60 ml-2">{{ props.aresWeightU }}%</span>
              </span>
            </label>
            <input
              id="aresWeightU"
              type="range"
              class="range range-sm"
              min="0"
              max="100"
              step="1"
              :value="props.aresWeightU"
              @input="(event) => onAresWeightInput('aresWeightU', event)"
            />
          </div>
        </div>
        <p class="text-xs text-base-content/60 mt-2">
          ARes 權重合計：{{ props.aresWeightTotal }}%，未分配：{{ props.aresWeightUnallocated }}%。
        </p>
        <div class="mt-4 border-t border-base-300 pt-4">
          <div class="text-sm font-semibold text-base-content/80 mb-3">
            RReq 比率隨機分配（當 ARes 狀態為 C 或 D 時）
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="md:row-start-1 md:col-start-1">
              <label class="label">
                <span class="label-text">
                  RReq Y 權重% (rreq_transStatus=Y)
                  <span class="text-xs text-base-content/60 ml-2"> {{ props.rreqWeightY }}% </span>
                </span>
              </label>
              <input
                id="rreqWeightY"
                type="range"
                class="range range-sm"
                min="0"
                max="100"
                step="1"
                :value="props.rreqWeightY"
                @input="(event) => onRreqWeightInput('rreqWeightY', event)"
              />
            </div>
            <div class="md:row-start-2 md:col-start-1">
              <label class="label">
                <span class="label-text">
                  RReq N 權重% (rreq_transStatus=N)
                  <span class="text-xs text-base-content/60 ml-2"> {{ props.rreqWeightN }}% </span>
                </span>
              </label>
              <input
                id="rreqWeightN"
                type="range"
                class="range range-sm"
                min="0"
                max="100"
                step="1"
                :value="props.rreqWeightN"
                @input="(event) => onRreqWeightInput('rreqWeightN', event)"
              />
            </div>
            <div class="md:row-start-3 md:col-start-1">
              <label class="label">
                <span class="label-text">
                  RReq NULL_VALUE 權重% (rreq_transStatus=NULL_VALUE)
                  <span class="text-xs text-base-content/60 ml-2">
                    {{ props.rreqWeightNull }}%
                  </span>
                </span>
              </label>
              <input
                id="rreqWeightNull"
                type="range"
                class="range range-sm"
                min="0"
                max="100"
                step="1"
                :value="props.rreqWeightNull"
                @input="(event) => onRreqWeightInput('rreqWeightNull', event)"
              />
            </div>
            <div class="md:row-start-2 md:col-start-2">
              <label class="label">
                <span class="label-text">
                  ChallengeCancel 觸發率 (0~100%) (challengeCancelRate)
                  <span class="text-xs text-base-content/60 ml-2">
                    {{ props.challengeCancelRate }}%
                  </span>
                </span>
              </label>
              <input
                id="challengeCancelRate"
                type="range"
                class="range range-sm"
                min="0"
                max="100"
                step="1"
                :value="props.challengeCancelRate"
                @input="
                  (event) =>
                    emit('update:challengeCancelRate', (event.target as HTMLInputElement).value)
                "
              />
            </div>
          </div>
        </div>
        <p class="text-xs text-base-content/60 mt-2">
          RReq 權重合計：{{ props.rreqWeightTotal }}%，未分配：{{ props.rreqWeightUnallocated }}%。
        </p>
        <div class="mt-4 border-t border-base-300 pt-4">
          <div class="text-sm font-semibold text-base-content/80 mb-2">
            stateMachineReason / transStatusReason（對齊 3DSS 後端語意）
          </div>
          <p class="text-xs text-base-content/60 mb-3 leading-relaxed">
            <strong>transStatusReason</strong>：最終狀態為 <strong>R</strong>（含挑戰後
            RReq=R）時，假資料會抽 ACS 原因碼。寫入前會依索引對齊兩端後端：
            <strong>3DSS</strong>（<code class="bg-base-300/60 px-1 rounded">3dss-transaction</code
            >）在 S 端 AReq／ARes／RReq 錯誤時對齊
            <code class="bg-base-300/60 px-1 rounded">U</code>／
            <code class="bg-base-300/60 px-1 rounded">07</code>（threeds-server-v3）；
            <strong>ACS</strong>（<code class="bg-base-300/60 px-1 rounded">acs-transaction</code
            >）在 errorComponent=A 時對齊
            <code class="bg-base-300/60 px-1 rounded"
              >ThreedsTransServiceCore.updateErrorStatus</code
            >
            預設（多為 <code class="bg-base-300/60 px-1 rounded">N</code>／<code
              class="bg-base-300/60 px-1 rounded"
              >09</code
            >／ challengeCancel
            <code class="bg-base-300/60 px-1 rounded">06</code>，Mastercard／CReq／UL 等有覆寫）。
            ACS 索引上若為 <strong>S</strong> 錯誤則仍依 3DSS 語意對齊。
            <strong>stateMachineReason</strong>：3DSS 成功路徑多半省略；ACS 以四位數 enum
            為主（隨機模式見表單）。
          </p>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="rounded-md border border-base-300 bg-base-100 p-3">
              <div class="text-sm font-semibold text-base-content/80 mb-2">transStatusReason</div>
              <Select
                id="transStatusReasonMode"
                label="模式"
                :model-value="props.transStatusReasonMode"
                :options="reasonModeOptions"
                @update:model-value="
                  (value) => onReasonModeChange('transStatusReasonMode', String(value))
                "
              />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Input
                  id="transStatusReasonInput"
                  label="輸入代碼"
                  :model-value="props.transStatusReason"
                  :disabled="props.transStatusReasonMode === 'random'"
                  @update:model-value="
                    (value) => onReasonValueChange('transStatusReason', String(value))
                  "
                />
                <Select
                  id="transStatusReasonSelect"
                  label="下拉選單"
                  :model-value="props.transStatusReason"
                  :options="transStatusReasonOptions"
                  :disabled="props.transStatusReasonMode === 'random'"
                  @update:model-value="
                    (value) => onReasonValueChange('transStatusReason', String(value))
                  "
                />
              </div>
            </div>
            <div class="rounded-md border border-base-300 bg-base-100 p-3">
              <div class="text-sm font-semibold text-base-content/80 mb-2">stateMachineReason</div>
              <Select
                id="stateMachineReasonMode"
                label="模式"
                :model-value="props.stateMachineReasonMode"
                :options="reasonModeOptions"
                @update:model-value="
                  (value) => onReasonModeChange('stateMachineReasonMode', String(value))
                "
              />
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <Input
                  id="stateMachineReasonInput"
                  label="輸入代碼"
                  :model-value="props.stateMachineReason"
                  :disabled="props.stateMachineReasonMode === 'random'"
                  @update:model-value="
                    (value) => onReasonValueChange('stateMachineReason', String(value))
                  "
                />
                <Select
                  id="stateMachineReasonSelect"
                  label="下拉選單"
                  :model-value="props.stateMachineReason"
                  :options="stateMachineReasonOptions"
                  :disabled="props.stateMachineReasonMode === 'random'"
                  @update:model-value="
                    (value) => onReasonValueChange('stateMachineReason', String(value))
                  "
                />
              </div>
            </div>
          </div>
          <p class="text-xs text-base-content/60 mt-2">
            選「全隨機」才會隨機；選「固定代碼」可輸入或下拉選取，並同步到上方欄位。
          </p>
          <p v-if="props.activeMode === 'dss'" class="text-xs text-base-content/60 mt-2">
            3DSS：全隨機時 stateMachineReason 依對 DS 之 AReq 錯誤類型加權（S3401/S3402 等），與
            ARes/RReq 旗標無強制對應；多數成功樣本不寫入該欄位。
          </p>
        </div>
      </div>
    </Card>
  </section>
</template>
