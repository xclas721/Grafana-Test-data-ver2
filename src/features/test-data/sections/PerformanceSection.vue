<script setup lang="ts">
import { Card, Input } from '@/shared/components'

const props = defineProps<{
  performancePath: string
  execTime: string
  creqExecTime: string
  rreqExecTime: string
  rbaExecTime: string
  cavvExecTime: string
  otpExecTime: string
  enableExecTimeRandom: boolean
  enableCreqExecTimeRandom: boolean
  enableRreqExecTimeRandom: boolean
  enableRbaExecTimeRandom: boolean
  enableCavvExecTimeRandom: boolean
  enableOtpExecTimeRandom: boolean
}>()

const emit = defineEmits<{
  'update:performancePath': [value: string]
  'update:execTime': [value: string]
  'update:creqExecTime': [value: string]
  'update:rreqExecTime': [value: string]
  'update:rbaExecTime': [value: string]
  'update:cavvExecTime': [value: string]
  'update:otpExecTime': [value: string]
  'update:enableExecTimeRandom': [value: boolean]
  'update:enableCreqExecTimeRandom': [value: boolean]
  'update:enableRreqExecTimeRandom': [value: boolean]
  'update:enableRbaExecTimeRandom': [value: boolean]
  'update:enableCavvExecTimeRandom': [value: boolean]
  'update:enableOtpExecTimeRandom': [value: boolean]
}>()
</script>

<template>
  <!-- 9.效能監控 -->
  <section id="performance" class="scroll-mt-24">
    <Card>
      <h3 class="text-base font-semibold text-base-content/80 mb-3">9.效能監控</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Input
          id="performancePath"
          label="Areq URL (performancePath)"
          :model-value="props.performancePath"
          @update:model-value="(value) => emit('update:performancePath', String(value))"
        />
        <div>
          <Input
            id="execTime"
            type="number"
            label="AReq 執行時間 (毫秒) (AReq execTime)"
            :model-value="props.execTime"
            required
            @update:model-value="(value) => emit('update:execTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableExecTimeRandom"
              @change="
                (event) =>
                  emit('update:enableExecTimeRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (1000-6000ms)，預設開啟</p>
        </div>
        <div>
          <Input
            id="creqExecTime"
            type="number"
            label="CReq 執行時間 (毫秒) (CReq execTime)"
            :model-value="props.creqExecTime"
            @update:model-value="(value) => emit('update:creqExecTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableCreqExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableCreqExecTimeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableCreqExecTimeRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableCreqExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (300-800ms)，預設開啟</p>
        </div>
        <div>
          <Input
            id="rreqExecTime"
            type="number"
            label="RReq 執行時間 (毫秒) (RReq execTime)"
            :model-value="props.rreqExecTime"
            @update:model-value="(value) => emit('update:rreqExecTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableRreqExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableRreqExecTimeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableRreqExecTimeRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableRreqExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (200-600ms)，預設開啟</p>
        </div>
        <div>
          <Input
            id="rbaExecTime"
            type="number"
            label="RBA 執行時間 (毫秒) (RBA execTime)"
            :model-value="props.rbaExecTime"
            @update:model-value="(value) => emit('update:rbaExecTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableRbaExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableRbaExecTimeRandom"
              @change="
                (event) =>
                  emit('update:enableRbaExecTimeRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableRbaExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (50-200ms)，預設開啟</p>
        </div>
        <div>
          <Input
            id="cavvExecTime"
            type="number"
            label="CAVV 響應時間 (毫秒) (CAVV execTime)"
            :model-value="props.cavvExecTime"
            @update:model-value="(value) => emit('update:cavvExecTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableCavvExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableCavvExecTimeRandom"
              @change="
                (event) =>
                  emit(
                    'update:enableCavvExecTimeRandom',
                    (event.target as HTMLInputElement).checked
                  )
              "
            />
            <label for="enableCavvExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (10-30ms)，預設開啟</p>
        </div>
        <div>
          <Input
            id="otpExecTime"
            type="number"
            label="簡訊OTP響應時間 (毫秒) (OTP execTime)"
            :model-value="props.otpExecTime"
            @update:model-value="(value) => emit('update:otpExecTime', String(value))"
          />
          <div class="flex items-center gap-2 mt-2">
            <input
              type="checkbox"
              id="enableOtpExecTimeRandom"
              class="checkbox checkbox-sm"
              :checked="props.enableOtpExecTimeRandom"
              @change="
                (event) =>
                  emit('update:enableOtpExecTimeRandom', (event.target as HTMLInputElement).checked)
              "
            />
            <label for="enableOtpExecTimeRandom" class="text-sm text-base-content/60">
              隨機生成時包含此欄位
            </label>
          </div>
          <p class="text-xs text-error mt-2">可隨機生成 (20-80ms)，預設開啟</p>
        </div>
      </div>
    </Card>
  </section>
</template>
