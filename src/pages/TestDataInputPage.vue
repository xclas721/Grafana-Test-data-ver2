<script setup lang="ts">
import { Button, Input, PageHeader, Select, type SelectOption } from '@/shared/components'
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
import { useTestDataForm } from '@/features/test-data/useTestDataForm'

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
  refreshAutoTimeRange
} = useTestDataForm()

const { posting, progress, insertOne, batchInsert, closeProgress } = useElasticsearchInsert({
  form,
  getFormData,
  generateRandomFields,
  refreshAutoTimeRange,
  setStatus
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader
      title="Test Data Input"
      subtitle="完整表單區塊已移植，支援預覽 JSON 與 Elasticsearch 單筆／批次 POST"
    />

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

    <div
      class="sticky top-16 z-10 mb-6 flex flex-wrap items-end gap-3 rounded-lg border border-base-300 bg-base-100/95 backdrop-blur px-4 py-3 shadow-sm"
    >
      <Select v-model="form.mode" label="產品模式" :options="modeOptions" class="min-w-[120px]" />
      <Input v-model="form.currentDate" type="date" label="基準日期" class="w-36" />
      <Input v-model="form.batchSize" label="批次筆數" class="w-28" />
      <Input v-model="form.batchDays" label="生成天數" class="w-28" />
      <Button variant="outline" @click="loadDefaults">載入預設值</Button>
      <Button variant="primary" :disabled="!isWeightValid" @click="generateRandomFields">
        隨機生成欄位
      </Button>
      <Button variant="primary" @click="generateOne">輸出單筆文件</Button>
      <Button variant="info" @click="generateBatchPreview">生成批次預覽</Button>
      <Button variant="primary" :disabled="posting" @click="insertOne">插入單筆到 ES</Button>
      <Button variant="primary" :disabled="posting || !isWeightValid" @click="batchInsert">
        批量生成並 POST
      </Button>
      <span v-if="!isWeightValid" class="text-xs text-warning pb-2">
        ARes/RReq 權重需各為 100% 才能隨機生成
      </span>
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
        v-model:issuer-oid="form.issuerOid"
        v-model:requestor-id="form.requestorId"
        v-model:acs-trans-id="form.acsTransId"
        v-model:three-d-s-server-trans-id="form.threeDSServerTransId"
      />

      <TransactionStatusSection
        :active-mode="form.mode"
        v-model:ares-trans-status="form.aresTransStatus"
        v-model:trans-status="form.transStatus"
        v-model:rreq-trans-status="form.rreqTransStatus"
        v-model:trans-status-reason="form.transStatusReason"
        v-model:state-machine-reason="form.stateMachineReason"
        v-model:trans-status-reason-mode="form.transStatusReasonMode"
        v-model:state-machine-reason-mode="form.stateMachineReasonMode"
        v-model:challenge-cancel="form.challengeCancel"
        v-model:ares-weight-y="form.aresWeightY"
        v-model:ares-weight-n="form.aresWeightN"
        v-model:ares-weight-r="form.aresWeightR"
        v-model:ares-weight-c="form.aresWeightC"
        v-model:ares-weight-d="form.aresWeightD"
        v-model:ares-weight-a="form.aresWeightA"
        v-model:ares-weight-i="form.aresWeightI"
        v-model:ares-weight-s="form.aresWeightS"
        v-model:ares-weight-u="form.aresWeightU"
        v-model:rreq-weight-null="form.rreqWeightNull"
        v-model:rreq-weight-y="form.rreqWeightY"
        v-model:rreq-weight-n="form.rreqWeightN"
        v-model:challenge-cancel-rate="form.challengeCancelRate"
        :ares-weight-total="aresWeightTotal"
        :ares-weight-unallocated="aresWeightUnallocated"
        :rreq-weight-total="rreqWeightTotal"
        :rreq-weight-unallocated="rreqWeightUnallocated"
        :expected-transaction-success-rate="expectedTransactionSuccessRate"
        :expected-frictionless-rate="expectedFrictionlessRate"
        :expected-challenge-success-rate="expectedChallengeSuccessRate"
        :disable-rreq-trans-status="form.disableRreqTransStatus"
        :disable-trans-status-reason="form.disableTransStatusReason"
        :disable-state-machine-reason="form.disableStateMachineReason"
        :disable-challenge-cancel="form.disableChallengeCancel"
      />

      <MerchantInfoSection
        v-model:merchant-name="form.merchantName"
        v-model:merchant-country-code="form.merchantCountryCode"
        v-model:acquirer-merchant-id="form.acquirerMerchantId"
        v-model:acquirer-bin="form.acquirerBin"
        v-model:mcc="form.mcc"
        v-model:enable-acquirer-merchant-id-random="form.enableAcquirerMerchantIdRandom"
        v-model:enable-acquirer-bin-random="form.enableAcquirerBinRandom"
        v-model:enable-merchant-country-code-random="form.enableMerchantCountryCodeRandom"
        v-model:enable-merchant-country-asia-only="form.enableMerchantCountryAsiaOnly"
        v-model:enable-merchant-random="form.enableMerchantRandom"
      />

      <PurchaseAmountSection
        v-model:purchase-amount="form.purchaseAmount"
        v-model:purchase-currency="form.purchaseCurrency"
        v-model:purchase-exponent="form.purchaseExponent"
        v-model:usd-amount="form.usdAmount"
        v-model:enable-purchase-amount-random="form.enablePurchaseAmountRandom"
        v-model:enable-purchase-currency-random="form.enablePurchaseCurrencyRandom"
      />

      <CountryCurrencySection
        v-model:country-alpha2="form.countryAlpha2"
        v-model:country-numeric="form.countryNumeric"
        v-model:country-alpha3="form.countryAlpha3"
        v-model:country-name="form.countryName"
        v-model:currency-minor-unit="form.currencyMinorUnit"
        v-model:currency-name="form.currencyName"
        v-model:currency-alphabetic-code="form.currencyAlphabeticCode"
        v-model:currency-numeric-code="form.currencyNumericCode"
      />

      <ExchangeRateSection
        v-model:exchange-rate="form.exchangeRate"
        v-model:exchange-base="form.exchangeBase"
        v-model:exchange-target="form.exchangeTarget"
        v-model:currency-code-for-rate="form.currencyCodeForRate"
      />

      <CardInfoSection
        v-model:card-scheme="form.cardScheme"
        v-model:acct-number="form.acctNumber"
        v-model:cardbin6="form.cardbin6"
        v-model:acct-number-hashed="form.acctNumberHashed"
        v-model:acct-number-mask="form.acctNumberMask"
        v-model:cardbin8="form.cardbin8"
        v-model:enable-card-scheme-random="form.enableCardSchemeRandom"
        v-model:visa-daf-message-extension="form.visaDafMessageExtension"
        v-model:mastercard-score="form.mastercardScore"
        v-model:mastercard-decision="form.mastercardDecision"
        v-model:mastercard-reason-code1="form.mastercardReasonCode1"
        v-model:mastercard-reason-code2="form.mastercardReasonCode2"
        v-model:mastercard-status="form.mastercardStatus"
        v-model:visa-risk-based-authentication-score="form.visaRiskBasedAuthenticationScore"
        v-model:enable-acct-number-random="form.enableAcctNumberRandom"
        v-model:enable-mastercard-extension="form.enableMastercardExtension"
        v-model:enable-mastercard-extension-random="form.enableMastercardExtensionRandom"
        v-model:enable-visa-score-random="form.enableVisaScoreRandom"
        :disable-card-scheme="disableCardScheme"
        :disable-mastercard-extension="disableMastercardExtension"
        :disable-visa-score-random="disableVisaScoreRandom"
        :show-mastercard-extension="showMastercardExtension"
      />

      <ThreeDSParamsSection
        v-model:message-category="form.messageCategory"
        v-model:message-version="form.messageVersion"
        v-model:device-channel="form.deviceChannel"
        v-model:three-d-s-requestor-challenge-ind="form.threeDSRequestorChallengeInd"
        v-model:authentication-method="form.authenticationMethod"
        v-model:authentication-type="form.authenticationType"
        v-model:device-ip-address="form.deviceIpAddress"
        v-model:browser-i-p="form.browserIP"
        v-model:device-platform="form.devicePlatform"
        v-model:device-locale="form.deviceLocale"
        v-model:device-advertising-id="form.deviceAdvertisingId"
        v-model:three-d-s-comp-ind="form.threeDSCompInd"
        v-model:merchant-country-code-str="form.merchantCountryCodeStr"
        v-model:enable-all3-d-s-params-random="form.enableAll3DSParamsRandom"
        v-model:enable-message-category="form.enableMessageCategory"
        v-model:enable-device-channel="form.enableDeviceChannel"
        v-model:enable-three-d-s-requestor-challenge-ind="form.enableThreeDSRequestorChallengeInd"
        v-model:enable-authentication-method-random="form.enableAuthenticationMethodRandom"
        v-model:enable-authentication-type-random="form.enableAuthenticationTypeRandom"
        v-model:enable-device-ip-address-random="form.enableDeviceIpAddressRandom"
        v-model:enable-device-platform-random="form.enableDevicePlatformRandom"
        v-model:enable-device-locale-random="form.enableDeviceLocaleRandom"
        v-model:enable-device-advertising-id-random="form.enableDeviceAdvertisingIdRandom"
        v-model:enable-three-d-s-comp-ind-random="form.enableThreeDSCompIndRandom"
        v-model:enable-merchant-country-code-str-random="form.enableMerchantCountryCodeStrRandom"
        v-model:enable-browser-geo-i-p-random="form.enableBrowserGeoIPRandom"
        v-model:enable-device-geo-i-p-random="form.enableDeviceGeoIPRandom"
      />

      <PerformanceSection
        v-model:performance-path="form.performancePath"
        v-model:exec-time="form.execTime"
        v-model:creq-exec-time="form.creqExecTime"
        v-model:rreq-exec-time="form.rreqExecTime"
        v-model:rba-exec-time="form.rbaExecTime"
        v-model:cavv-exec-time="form.cavvExecTime"
        v-model:otp-exec-time="form.otpExecTime"
        v-model:enable-exec-time-random="form.enableExecTimeRandom"
        v-model:enable-creq-exec-time-random="form.enableCreqExecTimeRandom"
        v-model:enable-rreq-exec-time-random="form.enableRreqExecTimeRandom"
        v-model:enable-rba-exec-time-random="form.enableRbaExecTimeRandom"
        v-model:enable-cavv-exec-time-random="form.enableCavvExecTimeRandom"
        v-model:enable-otp-exec-time-random="form.enableOtpExecTimeRandom"
      />

      <ErrorHandlingSection
        :active-mode="form.mode"
        v-model:enable-batch-error-mix="form.enableBatchErrorMix"
        v-model:batch-error-mix-percent="form.batchErrorMixPercent"
        v-model:error-component="form.errorComponent"
        v-model:error-description="form.errorDescription"
        v-model:error-code="form.errorCode"
        v-model:error-detail="form.errorDetail"
        v-model:error-message-type="form.errorMessageType"
      />
    </form>

    <div class="mt-6 grid grid-cols-1 xl:grid-cols-2 gap-6">
      <div class="card bg-base-100 border border-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="font-semibold text-base">單筆文件 JSON</h3>
          <pre
            class="mt-2 text-xs bg-base-200 p-3 rounded overflow-auto max-h-[480px] whitespace-pre-wrap"
            >{{ outputJson || '（按「輸出單筆文件」產生）' }}</pre
          >
        </div>
      </div>
      <div class="card bg-base-100 border border-base-200 shadow-sm">
        <div class="card-body">
          <h3 class="font-semibold text-base">批次預覽 JSON</h3>
          <p class="text-xs text-base-content/60 mt-1">
            若勾選「批次插入時依比例隨機混入錯誤」，預覽會依比例套用 EMV 錯誤預設。
          </p>
          <pre
            class="mt-2 text-xs bg-base-200 p-3 rounded overflow-auto max-h-[480px] whitespace-pre-wrap"
            >{{ batchPreviewJson || '（按「生成批次預覽」產生）' }}</pre
          >
        </div>
      </div>
    </div>

    <BulkProgressPanel
      :visible="progress.visible"
      :status-text="progress.statusText"
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

<style scoped>
.mode-indicator {
  display: inline-flex;
  align-items: center;
  padding: 0.15rem 0.5rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
.mode-indicator.acs {
  background: color-mix(in srgb, var(--color-primary) 15%, transparent);
  color: var(--color-primary);
}
.mode-indicator.dss {
  background: color-mix(in srgb, var(--color-secondary) 20%, transparent);
  color: var(--color-secondary);
}
</style>
