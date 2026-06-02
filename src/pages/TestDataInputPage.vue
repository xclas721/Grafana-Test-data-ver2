<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { PageHeader, type SelectOption } from '@/shared/components'
import CurrencyModal from '@/features/test-data/components/CurrencyModal.vue'
import TestDataActionBar from '@/features/test-data/components/TestDataActionBar.vue'
import BaseConfigSection from '@/features/test-data/sections/BaseConfigSection.vue'
import TransactionIdSection from '@/features/test-data/sections/TransactionIdSection.vue'
import TransactionStatusSection from '@/features/test-data/sections/TransactionStatusSection.vue'
import MerchantInfoSection from '@/features/test-data/sections/MerchantInfoSection.vue'
import PurchaseAmountSection from '@/features/test-data/sections/PurchaseAmountSection.vue'
import CountryCurrencySection from '@/features/test-data/sections/CountryCurrencySection.vue'
import ExchangeRateSection from '@/features/test-data/sections/ExchangeRateSection.vue'
import CardInfoSection from '@/features/test-data/sections/CardInfoSection.vue'
import ThreeDSParamsSection from '@/features/test-data/sections/ThreeDSParamsSection.vue'
import PerformanceSection from '@/features/test-data/sections/PerformanceSection.vue'
import ErrorHandlingSection from '@/features/test-data/sections/ErrorHandlingSection.vue'
import BulkProgressPanel from '@/features/test-data/components/BulkProgressPanel.vue'
import { useElasticsearchInsert } from '@/features/test-data/useElasticsearchInsert'
import { useScheduledBatchInsert } from '@/features/test-data/useScheduledBatchInsert'
import { useTestDataForm } from '@/features/test-data/useTestDataForm'

const { t } = useI18n()

const modeOptions: SelectOption[] = [
  { value: 'acs', label: 'ACS' },
  { value: 'dss', label: '3DSS' }
]

const {
  form,
  outputJson,
  batchPreviewJson,
  timeRangeHtml,
  modeText,
  modeClass,
  statusMessage,
  statusType,
  aresWeightTotal,
  rreqWeightTotal,
  aresWeightUnallocated,
  rreqWeightUnallocated,
  isWeightValid,
  expectedTransactionSuccessRate,
  expectedFrictionlessRate,
  expectedChallengeSuccessRate,
  disableCardScheme,
  disableMastercardExtension,
  disableVisaScoreRandom,
  showMastercardExtension,
  loadDefaults,
  generateRandomFields,
  generateOne,
  generateBatchPreview,
  getFormData,
  setStatus,
  refreshAutoTimeRange,
  onCurrencySelect
} = useTestDataForm()

const currencyModalVisible = ref(false)

const { posting, progress, insertOne, batchInsert, closeProgress } = useElasticsearchInsert({
  form,
  getFormData,
  generateRandomFields,
  refreshAutoTimeRange,
  setStatus
})

const {
  scheduleEnabled,
  scheduleIntervalSeconds,
  scheduleRunning,
  nextRunInSeconds,
  onToggleScheduleEnabled,
  onUpdateScheduleIntervalSeconds,
  startSchedule,
  stopSchedule
} = useScheduledBatchInsert({
  batchInsert,
  setBatchDays: (days) => {
    form.batchDays = days
  }
})

function onWriteModeChange(mode: 'manual' | 'scheduled') {
  onToggleScheduleEnabled(mode === 'scheduled')
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.testData.input')" :subtitle="t('page.testData.subtitle')" />

    <div
      class="mb-4 px-4 py-3 rounded-lg text-sm"
      :class="{
        'bg-success/10 text-success': statusType === 'success',
        'bg-warning/10 text-warning': statusType === 'warning',
        'bg-info/10 text-info': statusType === 'info',
        'bg-error/10 text-error': statusType === 'error'
      }"
    >
      {{ statusMessage }}
    </div>

    <TestDataActionBar
      :mode-options="modeOptions"
      :form-mode="form.mode"
      :current-date="form.currentDate"
      :batch-size="form.batchSize"
      :batch-days="form.batchDays"
      :enable-auto-time-range="form.enableAutoTimeRange"
      :schedule-enabled="scheduleEnabled"
      :schedule-interval-seconds="scheduleIntervalSeconds"
      :schedule-running="scheduleRunning"
      :next-run-in-seconds="nextRunInSeconds"
      :posting="posting"
      :is-weight-valid="isWeightValid"
      @update:form-mode="form.mode = $event as 'acs' | 'dss'"
      @update:current-date="form.currentDate = $event"
      @update:batch-size="form.batchSize = $event"
      @update:batch-days="form.batchDays = $event"
      @update:write-mode="onWriteModeChange"
      @update:schedule-interval-seconds="onUpdateScheduleIntervalSeconds"
      @load-defaults="loadDefaults"
      @randomize-fields="generateRandomFields"
      @preview-single="generateOne"
      @preview-batch="generateBatchPreview"
      @post-single="insertOne"
      @post-batch="batchInsert"
      @start-schedule="startSchedule"
      @stop-schedule="stopSchedule"
    />

    <div class="mb-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="app-form-card card bg-base-100 border border-base-300/80 shadow-sm">
        <div class="card-body">
          <h3 class="font-semibold text-base">{{ t('testData.actions.preview.single') }}</h3>
          <p class="text-xs text-base-content/60 mt-1">{{ t('testData.preview.single.hint') }}</p>
          <pre
            class="mt-2 text-xs bg-base-200 p-3 rounded overflow-auto max-h-[480px] whitespace-pre-wrap"
            >{{ outputJson || t('testData.preview.single.placeholder') }}</pre
          >
        </div>
      </div>
      <div class="app-form-card card bg-base-100 border border-base-300/80 shadow-sm">
        <div class="card-body">
          <h3 class="font-semibold text-base">{{ t('testData.actions.preview.batch') }}</h3>
          <p class="text-xs text-base-content/60 mt-1">{{ t('testData.preview.batch.hint') }}</p>
          <p class="text-xs text-base-content/50 mt-1">
            {{ t('testData.preview.batch.note') }}
          </p>
          <pre
            class="mt-2 text-xs bg-base-200 p-3 rounded overflow-auto max-h-[480px] whitespace-pre-wrap"
            >{{ batchPreviewJson || t('testData.preview.batch.placeholder') }}</pre
          >
        </div>
      </div>
    </div>

    <form class="space-y-6" @submit.prevent>
      <BaseConfigSection
        v-model:base-url="form.baseUrl"
        v-model:username="form.username"
        v-model:password="form.password"
        v-model:current-date="form.currentDate"
        v-model:enable-custom-time-range="form.enableCustomTimeRange"
        v-model:enable-auto-time-range="form.enableAutoTimeRange"
        v-model:start-date-time="form.startDateTime"
        v-model:end-date-time="form.endDateTime"
        v-model:timezone="form.timezone"
        :mode-text="modeText"
        :mode-class="modeClass"
        :time-range-html="timeRangeHtml"
      />

      <TransactionIdSection
        v-model:acs-trans-id="form.acsTransId"
        v-model:three-ds-server-trans-id="form.threeDSServerTransId"
        v-model:ds-trans-id="form.dsTransId"
        v-model:enable-acs-trans-id-random="form.enableAcsTransIdRandom"
        v-model:enable-three-ds-server-trans-id-random="form.enableThreeDSServerTransIdRandom"
        v-model:enable-ds-trans-id-random="form.enableDsTransIdRandom"
      />

      <TransactionStatusSection
        v-model:trans-status="form.transStatus"
        v-model:trans-status-reason="form.transStatusReason"
        v-model:state-machine-reason="form.stateMachineReason"
        v-model:ares-trans-status="form.aresTransStatus"
        v-model:rreq-trans-status="form.rreqTransStatus"
        v-model:ares-weight-y="form.aresWeightY"
        v-model:ares-weight-n="form.aresWeightN"
        v-model:ares-weight-a="form.aresWeightA"
        v-model:ares-weight-r="form.aresWeightR"
        v-model:ares-weight-u="form.aresWeightU"
        v-model:rreq-weight-y="form.rreqWeightY"
        v-model:rreq-weight-n="form.rreqWeightN"
        v-model:rreq-weight-a="form.rreqWeightA"
        v-model:rreq-weight-r="form.rreqWeightR"
        v-model:rreq-weight-u="form.rreqWeightU"
        :ares-weight-total="aresWeightTotal"
        :rreq-weight-total="rreqWeightTotal"
        :ares-weight-unallocated="aresWeightUnallocated"
        :rreq-weight-unallocated="rreqWeightUnallocated"
        :expected-transaction-success-rate="expectedTransactionSuccessRate"
        :expected-frictionless-rate="expectedFrictionlessRate"
        :expected-challenge-success-rate="expectedChallengeSuccessRate"
      />

      <MerchantInfoSection
        v-model:acquirer-bin="form.acquirerBIN"
        v-model:acquirer-merchant-id="form.acquirerMerchantID"
        v-model:merchant-name="form.merchantName"
        v-model:mcc="form.mcc"
        v-model:merchant-country-code="form.merchantCountryCode"
        :disable-card-scheme="disableCardScheme"
      />

      <PurchaseAmountSection
        v-model:purchase-amount="form.purchaseAmount"
        v-model:purchase-currency="form.purchaseCurrency"
        v-model:purchase-exponent="form.purchaseExponent"
        v-model:enable-purchase-amount-random="form.enablePurchaseAmountRandom"
        v-model:enable-purchase-currency-random="form.enablePurchaseCurrencyRandom"
        @open-currency-picker="currencyModalVisible = true"
      />

      <CountryCurrencySection
        v-model:cardholder-bill-currency="form.cardholderBillCurrency"
        v-model:cardholder-bill-exponent="form.cardholderBillExponent"
        v-model:cardholder-bill-amount="form.cardholderBillAmount"
        v-model:cardholder-bill-conversion-rate="form.cardholderBillConversionRate"
        v-model:cardholder-bill-conversion-date="form.cardholderBillConversionDate"
        v-model:enable-cardholder-bill-currency-random="form.enableCardholderBillCurrencyRandom"
        v-model:enable-cardholder-bill-exponent-random="form.enableCardholderBillExponentRandom"
        v-model:enable-cardholder-bill-amount-random="form.enableCardholderBillAmountRandom"
        v-model:enable-cardholder-bill-conversion-rate-random="
          form.enableCardholderBillConversionRateRandom
        "
        v-model:enable-cardholder-bill-conversion-date-random="
          form.enableCardholderBillConversionDateRandom
        "
      />

      <ExchangeRateSection
        v-model:exchange-rate="form.exchangeRate"
        v-model:enable-exchange-rate-random="form.enableExchangeRateRandom"
      />

      <CardInfoSection
        v-model:acct-number="form.acctNumber"
        v-model:card-expiry-date="form.cardExpiryDate"
        v-model:card-scheme="form.cardScheme"
        v-model:enable-acct-number-random="form.enableAcctNumberRandom"
        v-model:enable-card-expiry-date-random="form.enableCardExpiryDateRandom"
        v-model:enable-card-scheme-random="form.enableCardSchemeRandom"
        :disable-mastercard-extension="disableMastercardExtension"
        :disable-visa-score-random="disableVisaScoreRandom"
        :show-mastercard-extension="showMastercardExtension"
        v-model:enable-mastercard-extension="form.enableMastercardExtension"
        v-model:mastercard-risk-assessment-score="form.mastercardRiskAssessmentScore"
        v-model:enable-mastercard-risk-assessment-score-random="
          form.enableMastercardRiskAssessmentScoreRandom
        "
        v-model:visa-score="form.visaScore"
        v-model:enable-visa-score-random="form.enableVisaScoreRandom"
      />

      <ThreeDSParamsSection
        v-model:message-category="form.messageCategory"
        v-model:device-channel="form.deviceChannel"
        v-model:three-ds-requestor-challenge-ind="form.threeDSRequestorChallengeInd"
        v-model:enable-message-category="form.enableMessageCategory"
        v-model:enable-device-channel="form.enableDeviceChannel"
        v-model:enable-three-ds-requestor-challenge-ind="form.enableThreeDSRequestorChallengeInd"
        v-model:enable-authentication-method-random="form.enableAuthenticationMethodRandom"
        v-model:enable-authentication-type-random="form.enableAuthenticationTypeRandom"
        v-model:enable-device-ip-address-random="form.enableDeviceIpAddressRandom"
        v-model:enable-device-platform-random="form.enableDevicePlatformRandom"
        v-model:enable-device-locale-random="form.enableDeviceLocaleRandom"
        v-model:enable-device-advertising-id-random="form.enableDeviceAdvertisingIdRandom"
        v-model:enable-three-ds-comp-ind-random="form.enableThreeDSCompIndRandom"
        v-model:enable-merchant-country-code-str-random="form.enableMerchantCountryCodeStrRandom"
      />

      <PerformanceSection
        v-model:interaction-counter="form.interactionCounter"
        v-model:enable-interaction-counter-random="form.enableInteractionCounterRandom"
      />

      <ErrorHandlingSection
        v-model:enable-batch-error-mix="form.enableBatchErrorMix"
        v-model:batch-error-mix-percent="form.batchErrorMixPercent"
      />
    </form>

    <CurrencyModal
      v-model:visible="currencyModalVisible"
      :purchase-currency="form.purchaseCurrency"
      @select="onCurrencySelect"
    />

    <BulkProgressPanel
      :visible="progress.visible"
      :finished="progress.finished"
      :phase-label="progress.phaseLabel"
      :summary="progress.summary"
      :current="progress.current"
      :total="progress.total"
      :success="progress.success"
      :error="progress.error"
      :elapsed-sec="progress.elapsedSec"
      :logs="progress.logs"
      :errors="progress.errors"
      @close="closeProgress"
    />
  </div>
</template>
