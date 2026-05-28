<script setup lang="ts">
import { Card, Input, Select, type SelectOption } from '@/shared/components'

const props = defineProps<{
  messageCategory: string
  messageVersion: string
  deviceChannel: string
  threeDSRequestorChallengeInd: string
  authenticationMethod: string
  authenticationType: string
  deviceIpAddress: string
  browserIP: string
  devicePlatform: string
  deviceLocale: string
  deviceAdvertisingId: string
  threeDSCompInd: string
  merchantCountryCodeStr: string
  enableAll3DSParamsRandom: boolean
  enableMessageCategory: boolean
  enableDeviceChannel: boolean
  enableThreeDSRequestorChallengeInd: boolean
  enableAuthenticationMethodRandom: boolean
  enableAuthenticationTypeRandom: boolean
  enableDeviceIpAddressRandom: boolean
  enableDevicePlatformRandom: boolean
  enableDeviceLocaleRandom: boolean
  enableDeviceAdvertisingIdRandom: boolean
  enableThreeDSCompIndRandom: boolean
  enableMerchantCountryCodeStrRandom: boolean
  enableBrowserGeoIPRandom: boolean
  enableDeviceGeoIPRandom: boolean
}>()

const emit = defineEmits<{
  'update:messageCategory': [value: string]
  'update:messageVersion': [value: string]
  'update:deviceChannel': [value: string]
  'update:threeDSRequestorChallengeInd': [value: string]
  'update:authenticationMethod': [value: string]
  'update:authenticationType': [value: string]
  'update:deviceIpAddress': [value: string]
  'update:browserIP': [value: string]
  'update:devicePlatform': [value: string]
  'update:deviceLocale': [value: string]
  'update:deviceAdvertisingId': [value: string]
  'update:threeDSCompInd': [value: string]
  'update:merchantCountryCodeStr': [value: string]
  'update:enableAll3DSParamsRandom': [value: boolean]
  'update:enableMessageCategory': [value: boolean]
  'update:enableDeviceChannel': [value: boolean]
  'update:enableThreeDSRequestorChallengeInd': [value: boolean]
  'update:enableAuthenticationMethodRandom': [value: boolean]
  'update:enableAuthenticationTypeRandom': [value: boolean]
  'update:enableDeviceIpAddressRandom': [value: boolean]
  'update:enableDevicePlatformRandom': [value: boolean]
  'update:enableDeviceLocaleRandom': [value: boolean]
  'update:enableDeviceAdvertisingIdRandom': [value: boolean]
  'update:enableThreeDSCompIndRandom': [value: boolean]
  'update:enableMerchantCountryCodeStrRandom': [value: boolean]
  'update:enableBrowserGeoIPRandom': [value: boolean]
  'update:enableDeviceGeoIPRandom': [value: boolean]
}>()

const messageCategoryOptions: SelectOption[] = [
  { value: '01', label: '01 - PA (Payment Authentication)' },
  { value: '02', label: '02 - NPA (Non-Payment Authentication)' },
  { value: '80', label: '80 - Mastercard Identity Check Insights' },
  { value: '85', label: '85 - Mastercard PVPA' },
  { value: '86', label: '86 - Mastercard PVNPA' }
]

const messageVersionOptions: SelectOption[] = [
  { value: '2.1.0', label: '2.1.0' },
  { value: '2.2.0', label: '2.2.0' },
  { value: '2.3.1', label: '2.3.1' }
]

const deviceChannelOptions: SelectOption[] = [
  { value: '02', label: '02 - Browser (BRW)' },
  { value: '03', label: '03 - 3DS Requestor Initiated (3RI)' }
]

const requestorChallengeOptions: SelectOption[] = [
  { value: '01', label: '01 = No preference' },
  { value: '02', label: '02 = No challenge requested' },
  { value: '03', label: '03 = Challenge requested: 3DS Requestor Preference' },
  { value: '04', label: '04 = Challenge requested: Mandate' },
  {
    value: '05',
    label: '05 = No challenge requested (transactional risk analysis is already performed)'
  },
  { value: '06', label: '06 = No challenge requested (Data share only)' },
  {
    value: '07',
    label: '07 = No challenge requested (strong consumer authentication is already performed)'
  },
  {
    value: '08',
    label: '08 = No challenge requested (utilise Trust List exemption if no challenge required)'
  },
  {
    value: '09',
    label: '09 = Challenge requested (Trust List prompt requested if challenge required)'
  },
  { value: '10', label: '10 = No challenge requested (utilise low value exemption)' },
  { value: '11', label: '11 = No challenge requested (Secure corporate payment exemption)' },
  {
    value: '12',
    label: '12 = Challenge requested (Device Binding prompt requested if challenge required)'
  },
  { value: '13', label: '13 = Challenge requested (Issuer requested)' },
  { value: '14', label: '14 = Challenge requested (Merchant initiated transactions)' },
  {
    value: '80',
    label: '80 = (Visa) Remove specified VMID+PAN from Trusted Listing database'
  },
  { value: '82', label: '82 = (Visa) NO CHALLENGE REQUESTED. Secure Corporate Exemption' }
]

const threeDSCompIndOptions: SelectOption[] = [
  { value: '', label: '留空' },
  { value: 'Y', label: 'Y - Yes' },
  { value: 'N', label: 'N - No' }
]

const merchantCountryCodeStrOptions: SelectOption[] = [
  { value: '156', label: '156 - 中國 (CN)' },
  { value: '158', label: '158 - 台灣 (TW)' },
  { value: '840', label: '840 - 美國 (US)' },
  { value: '392', label: '392 - 日本 (JP)' },
  { value: '344', label: '344 - 香港 (HK)' },
  { value: '410', label: '410 - 韓國 (KR)' },
  { value: '702', label: '702 - 新加坡 (SG)' },
  { value: '036', label: '036 - 澳洲 (AU)' },
  { value: '124', label: '124 - 加拿大 (CA)' },
  { value: '978', label: '978 - 歐元區 (EU)' },
  { value: '826', label: '826 - 英國 (GB)' },
  { value: '116', label: '116 - 柬埔寨 (KH)' }
]
</script>

<template>
  <!-- 8.3DS 參數 -->
  <section id="three-ds-params" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">8.3DS 參數</h3>
      <div class="flex items-center gap-2 mb-4 rounded-md bg-base-200 px-3 py-2">
        <input
          type="checkbox"
          id="enableAll3DSParamsRandom"
          class="checkbox checkbox-sm"
          :checked="props.enableAll3DSParamsRandom"
          @change="
            (event) =>
              emit('update:enableAll3DSParamsRandom', (event.target as HTMLInputElement).checked)
          "
        />
        <label for="enableAll3DSParamsRandom" class="text-sm font-semibold">
          全選：隨機生成時包含所有 3DS 參數欄位
        </label>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div>
          <Select
            id="messageCategory"
            label="訊息類別 (messageCategory)"
            :model-value="props.messageCategory"
            :options="messageCategoryOptions"
            required
            @update:model-value="(value) => emit('update:messageCategory', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableMessageCategory"
              class="checkbox checkbox-sm"
              :checked="props.enableMessageCategory"
              @change="
                (event) =>
                  emit('update:enableMessageCategory', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableMessageCategory" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成，預設關閉</p>
        </div>
        <div>
          <Select
            id="messageVersion"
            label="訊息版本 (messageVersion)"
            :model-value="props.messageVersion"
            :options="messageVersionOptions"
            required
            @update:model-value="(value) => emit('update:messageVersion', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-2">
            對應 ACS dashboard 的 Message Version 篩選欄位
          </p>
        </div>
        <div>
          <Select
            id="deviceChannel"
            label="裝置通道 (deviceChannel)"
            :model-value="props.deviceChannel"
            :options="deviceChannelOptions"
            required
            @update:model-value="(value) => emit('update:deviceChannel', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableDeviceChannel"
              class="checkbox checkbox-sm"
              :checked="props.enableDeviceChannel"
              @change="
                (event) =>
                  emit('update:enableDeviceChannel', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableDeviceChannel" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成，預設關閉</p>
        </div>
        <div>
          <Select
            id="threeDSRequestorChallengeInd"
            label="3DS 請求方挑戰指標 (RequestorChlgInd)"
            :model-value="props.threeDSRequestorChallengeInd"
            :options="requestorChallengeOptions"
            required
            @update:model-value="
              (value) => emit('update:threeDSRequestorChallengeInd', String(value))
            "
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableThreeDSRequestorChallengeInd"
              class="checkbox checkbox-sm"
              :checked="props.enableThreeDSRequestorChallengeInd"
              @change="
                (event) =>
                  emit(
                    'update:enableThreeDSRequestorChallengeInd',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableThreeDSRequestorChallengeInd" class="text-sm text-base-content/60">
              隨機生成時包含此欄位（Visa 才會隨機到 80/82）
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成，預設關閉</p>
        </div>
        <div>
          <Input
            id="authenticationMethod"
            label="認證方法 (authenticationMethod)"
            :model-value="props.authenticationMethod"
            @update:model-value="(value) => emit('update:authenticationMethod', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableAuthenticationMethodRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableAuthenticationMethodRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableAuthenticationMethodRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableAuthenticationMethodRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (01-05)</p>
        </div>
        <div>
          <Input
            id="authenticationType"
            label="認證類型 (authenticationType)"
            :model-value="props.authenticationType"
            @update:model-value="(value) => emit('update:authenticationType', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableAuthenticationTypeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableAuthenticationTypeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableAuthenticationTypeRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableAuthenticationTypeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (01-05)</p>
        </div>
        <div>
          <Input
            id="deviceIpAddress"
            label="設備 IP 位址 (deviceIpAddress)"
            :model-value="props.deviceIpAddress"
            @update:model-value="(value) => emit('update:deviceIpAddress', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableDeviceIpAddressRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableDeviceIpAddressRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableDeviceIpAddressRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableDeviceIpAddressRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位（瀏覽器 IP 會跟隨）
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 IPv4/IPv6，瀏覽器 IP 會自動跟隨</p>
        </div>
        <div>
          <Input
            id="browserIP"
            label="瀏覽器 IP (browserIP)"
            :model-value="props.browserIP"
            @update:model-value="(value) => emit('update:browserIP', String(value))"
          />
          <p class="text-xs text-base-content/60 mt-1">自動跟隨設備 IP 位址</p>
        </div>
        <div>
          <Input
            id="devicePlatform"
            label="設備平台 (devicePlatform)"
            :model-value="props.devicePlatform"
            @update:model-value="(value) => emit('update:devicePlatform', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableDevicePlatformRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableDevicePlatformRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableDevicePlatformRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableDevicePlatformRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (如: MacIntel, Win32, Linux x86_64)</p>
        </div>
        <div>
          <Input
            id="deviceLocale"
            label="設備語言設定 (deviceLocale)"
            :model-value="props.deviceLocale"
            @update:model-value="(value) => emit('update:deviceLocale', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableDeviceLocaleRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableDeviceLocaleRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableDeviceLocaleRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableDeviceLocaleRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (如: zh-TW, zh-CN, en-US)</p>
        </div>
        <div>
          <Input
            id="deviceAdvertisingId"
            label="設備廣告 ID (deviceAdvertisingId)"
            :model-value="props.deviceAdvertisingId"
            @update:model-value="(value) => emit('update:deviceAdvertisingId', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableDeviceAdvertisingIdRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableDeviceAdvertisingIdRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableDeviceAdvertisingIdRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableDeviceAdvertisingIdRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 32 位十六進制字串</p>
        </div>
        <div>
          <Select
            id="threeDSCompInd"
            label="3DS 完成指示 (threeDSCompInd)"
            :model-value="props.threeDSCompInd"
            :options="threeDSCompIndOptions"
            @update:model-value="(value) => emit('update:threeDSCompInd', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableThreeDSCompIndRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableThreeDSCompIndRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableThreeDSCompIndRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableThreeDSCompIndRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (Y/N)</p>
        </div>
        <div class="rounded-md border border-error/40 bg-error/5 p-3">
          <Select
            id="merchantCountryCodeStr"
            label="商戶國家代碼 (字串) (merchantCountryCodeStr)"
            :model-value="props.merchantCountryCodeStr"
            :options="merchantCountryCodeStrOptions"
            :disabled="true"
            @update:model-value="(value) => emit('update:merchantCountryCodeStr', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableMerchantCountryCodeStrRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableMerchantCountryCodeStrRandom"
              :disabled="true"
              @change="
                (event) =>
                  emit(
                    'update:enableMerchantCountryCodeStrRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableMerchantCountryCodeStrRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-base-content/60 mt-2">
            由 merchantCountryCode 同步產生，無需手動調整
          </p>
        </div>
        <div>
          <label class="label">
            <span class="label-text">瀏覽器 IP 地理位置 (browserGeoIP)</span>
          </label>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableBrowserGeoIPRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableBrowserGeoIPRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableBrowserGeoIPRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableBrowserGeoIPRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位（預設開啟）
            </label>
          </div>
          <p class="text-xs text-error mt-2">
            預設生成地理位置資訊（基於國家代碼），可隨機生成城市、座標等
          </p>
        </div>
        <div>
          <label class="label">
            <span class="label-text">設備 IP 地理位置 (deviceGeoIP)</span>
          </label>
          <div class="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableDeviceGeoIPRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableDeviceGeoIPRandom"
              @change="
                (event) =>
                  emit('update:enableDeviceGeoIPRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableDeviceGeoIPRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位（預設開啟）
            </label>
          </div>
          <p class="text-xs text-error mt-2">
            預設生成地理位置資訊（基於國家代碼），可隨機生成城市、座標等
          </p>
        </div>
      </div>
    </Card>
  </section>
</template>
