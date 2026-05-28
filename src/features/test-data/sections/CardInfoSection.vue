<script setup lang="ts">
import { Card, Input, Select, type SelectOption } from '@/shared/components'

const props = defineProps<{
  cardScheme: string
  acctNumber: string
  cardbin6: string
  acctNumberHashed: string
  acctNumberMask: string
  cardbin8: string
  enableCardSchemeRandom: boolean
  visaDafMessageExtension: string
  mastercardScore: string
  mastercardDecision: string
  mastercardReasonCode1: string
  mastercardReasonCode2: string
  mastercardStatus: string
  visaRiskBasedAuthenticationScore: string
  enableAcctNumberRandom: boolean
  enableMastercardExtension: boolean
  enableMastercardExtensionRandom: boolean
  enableVisaScoreRandom: boolean
  disableCardScheme: boolean
  disableMastercardExtension: boolean
  disableVisaScoreRandom: boolean
  showMastercardExtension: boolean
}>()

const emit = defineEmits<{
  'update:cardScheme': [value: string]
  'update:acctNumber': [value: string]
  'update:cardbin6': [value: string]
  'update:acctNumberHashed': [value: string]
  'update:acctNumberMask': [value: string]
  'update:cardbin8': [value: string]
  'update:enableCardSchemeRandom': [value: boolean]
  'update:visaDafMessageExtension': [value: string]
  'update:mastercardScore': [value: string]
  'update:mastercardDecision': [value: string]
  'update:mastercardReasonCode1': [value: string]
  'update:mastercardReasonCode2': [value: string]
  'update:mastercardStatus': [value: string]
  'update:visaRiskBasedAuthenticationScore': [value: string]
  'update:enableAcctNumberRandom': [value: boolean]
  'update:enableMastercardExtension': [value: boolean]
  'update:enableMastercardExtensionRandom': [value: boolean]
  'update:enableVisaScoreRandom': [value: boolean]
}>()

const cardSchemeOptions: SelectOption[] = [
  { value: 'V', label: 'V - Visa' },
  { value: 'M', label: 'M - Mastercard' },
  { value: 'J', label: 'J - JCB' },
  { value: 'A', label: 'A - American Express' },
  { value: 'C', label: 'C - CUP' },
  { value: 'D', label: 'D - Diners Club / Discover' },
  { value: 'P', label: 'P - PayNet' },
  { value: 'S', label: 'S - Saudi MADA' },
  { value: 'E', label: 'E - EftPos' },
  { value: 'T', label: 'T - Thai Payment Network' },
  { value: 'U', label: 'U - UL-STP' }
]

const mastercardDecisionOptions: SelectOption[] = [
  { value: 'Not Low Risk', label: 'Not Low Risk' },
  { value: 'Low Risk', label: 'Low Risk' }
]
</script>

<template>
  <!-- 7.卡片信息 -->
  <section id="card-info" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">7.卡片信息</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="rounded-md border border-info/40 bg-info/5 p-3">
          <Select
            id="cardScheme"
            label="卡片組織 (cardScheme)"
            :model-value="props.cardScheme"
            :options="cardSchemeOptions"
            required
            :disabled="props.disableCardScheme"
            @update:model-value="(value) => emit('update:cardScheme', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableCardSchemeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableCardSchemeRandom"
              @change="
                (event) =>
                  emit('update:enableCardSchemeRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableCardSchemeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-base-content/60 mt-1">
            提示：
            <br />
            切到 Visa 會自動勾選隨機 DAF 訊息擴展
            <br />切到 Mastercard隨機 會自動勾選 M card 訊息擴展 <br />須解除啟用才能修改
          </p>
        </div>
        <div>
          <Input
            id="acctNumber"
            label="帳號原始值 (acctNumber)"
            :model-value="props.acctNumber"
            :maxlength="19"
            @update:model-value="(value) => emit('update:acctNumber', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableAcctNumberRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableAcctNumberRandom"
              @change="
                (event) =>
                  emit('update:enableAcctNumberRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableAcctNumberRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">此欄位不會 POST 出去，僅用於自動生成其他欄位</p>
          <p class="text-xs text-base-content/60 mt-3">
            勾選隨機生成時，會依卡組織前綴產生帳號原始值
          </p>
          <div class="mt-2 overflow-x-auto">
            <table class="table table-xs">
              <thead>
                <tr>
                  <th>卡組織</th>
                  <th>範圍</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>CUP</td>
                  <td>8183520000000000 ~ 8183529999999999</td>
                </tr>
                <tr>
                  <td>Thai Payment Network (TPN)</td>
                  <td>9793520000000000 ~ 9793529999999999</td>
                </tr>
                <tr>
                  <td>American Express</td>
                  <td>6563520000000000 ~ 6563529999999999</td>
                </tr>
                <tr>
                  <td>JCB</td>
                  <td>3133520000000000 ~ 3133529999999999</td>
                </tr>
                <tr>
                  <td>Diners Club / Discover (D)</td>
                  <td>3643520000000000 ~ 3643529999999999</td>
                </tr>
                <tr>
                  <td>MasterCard</td>
                  <td>5153520000000000 ~ 5153529999999999</td>
                </tr>
                <tr>
                  <td>Visa</td>
                  <td>4143520000000000 ~ 4143529999999999</td>
                </tr>
                <tr>
                  <td>EFTPOS (E)</td>
                  <td>6013520000000000 ~ 6013529999999999</td>
                </tr>
                <tr>
                  <td>PayNet (P)</td>
                  <td>6023520000000000 ~ 6023529999999999</td>
                </tr>
                <tr>
                  <td>Saudi MADA (S)</td>
                  <td>6033520000000000 ~ 6033529999999999</td>
                </tr>
                <tr>
                  <td>UL-STP (U)</td>
                  <td>6043520000000000 ~ 6043529999999999</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <Input
            id="cardbin6"
            label="卡片 BIN (6位) (cardbin6)"
            :model-value="props.cardbin6"
            :maxlength="6"
            required
            :disabled="true"
            @update:model-value="(value) => emit('update:cardbin6', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">自動從帳號原始值前6碼生成</p>
        </div>
        <div>
          <Input
            id="acctNumberHashed"
            label="帳號雜湊值 (acctNumberHashed)"
            :model-value="props.acctNumberHashed"
            :disabled="true"
            @update:model-value="(value) => emit('update:acctNumberHashed', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">
            自動從帳號原始值計算 (HMAC-SHA256 + Base64)
          </p>
        </div>
        <div>
          <Input
            id="acctNumberMask"
            label="帳號遮罩 (acctNumberMask)"
            :model-value="props.acctNumberMask"
            :disabled="true"
            @update:model-value="(value) => emit('update:acctNumberMask', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">
            自動從帳號原始值生成（前6碼+******+後4碼）
          </p>
        </div>
        <div>
          <Input
            id="cardbin8"
            label="卡片 BIN (8位) (cardbin8)"
            :model-value="props.cardbin8"
            :maxlength="8"
            required
            :disabled="true"
            @update:model-value="(value) => emit('update:cardbin8', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">自動從帳號原始值前8碼生成</p>
        </div>

        <!-- 卡片組織擴展內容（Visa / Mastercard）-->
        <div class="rounded-md border border-info/40 bg-info/5 p-3">
          <Input
            id="visaDafMessageExtension"
            label="Visa DAF 訊息擴展 (visaDafMessageExtension)"
            :model-value="props.visaDafMessageExtension"
            @update:model-value="(value) => emit('update:visaDafMessageExtension', String(value))"
          />
        </div>
        <div class="md:col-span-2 rounded-md border border-info/40 bg-info/5 p-3">
          <label class="label">
            <span class="label-text">Mastercard 訊息擴展 (mastercardMessageExtension)</span>
          </label>
          <div class="flex items-center gap-2 mb-3">
            <input
              type="checkbox"
              id="enableMastercardExtension"
              class="checkbox checkbox-sm"
              :checked="props.enableMastercardExtension"
              :disabled="props.disableMastercardExtension"
              @change="
                (event) =>
                  emit(
                    'update:enableMastercardExtension',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableMastercardExtension" class="text-sm text-base-content/60">
              啟用 Mastercard 訊息擴展
            </label>
          </div>
          <div
            id="mastercardExtensionContainer"
            class="rounded-md border border-base-300 bg-base-200 p-4"
            v-show="props.showMastercardExtension"
          >
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="mastercardScore"
                type="number"
                label="Score (0-650)"
                :model-value="props.mastercardScore"
                :min="'0'"
                :max="'650'"
                @update:model-value="(value) => emit('update:mastercardScore', String(value))"
              />
              <Select
                id="mastercardDecision"
                label="Decision"
                :model-value="props.mastercardDecision"
                :options="mastercardDecisionOptions"
                @update:model-value="(value) => emit('update:mastercardDecision', String(value))"
              />
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Input
                id="mastercardReasonCode1"
                label="Reason Code 1"
                :model-value="props.mastercardReasonCode1"
                :maxlength="1"
                @update:model-value="(value) => emit('update:mastercardReasonCode1', String(value))"
              />
              <Input
                id="mastercardReasonCode2"
                label="Reason Code 2"
                :model-value="props.mastercardReasonCode2"
                :maxlength="1"
                @update:model-value="(value) => emit('update:mastercardReasonCode2', String(value))"
              />
            </div>
            <Input
              id="mastercardStatus"
              label="Status"
              :model-value="props.mastercardStatus"
              @update:model-value="(value) => emit('update:mastercardStatus', String(value))"
            />
            <div class="flex items-center gap-2 mt-3">
              <input
                type="checkbox"
                id="enableMastercardExtensionRandom"
                class="checkbox checkbox-sm"
                :checked="props.enableMastercardExtensionRandom"
                @change="
                  (event) =>
                    emit(
                      'update:enableMastercardExtensionRandom',
                      (event.target as HTMLInputElement).checked
                    )
                "
              />
              <label for="enableMastercardExtensionRandom" class="text-sm text-base-content/60">
                隨機生成時包含此欄位
              </label>
            </div>
            <p class="text-xs text-error mt-2">可隨機生成：Score、Decision，其他欄位保持預設值</p>
          </div>
        </div>
        <div class="rounded-md border border-info/40 bg-info/5 p-3">
          <Input
            id="visaRiskBasedAuthenticationScore"
            type="number"
            label="Visa 風險基礎認證分數 (visaRiskBasedAuthenticationScore)"
            :model-value="props.visaRiskBasedAuthenticationScore"
            :min="'0'"
            :max="'99'"
            placeholder="留空為 NULL"
            @update:model-value="
              (value) => emit('update:visaRiskBasedAuthenticationScore', String(value))
            "
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableVisaScoreRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableVisaScoreRandom"
              :disabled="props.disableVisaScoreRandom"
              @change="
                (event) =>
                  emit('update:enableVisaScoreRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableVisaScoreRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (0-99)，留空為 NULL</p>
        </div>
      </div>
    </Card>
  </section>
</template>
