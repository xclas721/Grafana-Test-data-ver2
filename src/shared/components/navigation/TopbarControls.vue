<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { DateTime } from 'luxon'
import {
  ChevronDown,
  Circle,
  CircleCheck,
  Clock,
  PanelLeft,
  RotateCcw,
  Snowflake,
  Sun
} from 'lucide-vue-next'
import { useI18nStore } from '@/stores/i18n'
import type { Locale } from '@/stores/i18n'
import { useThemeStore } from '@/stores/theme'
import { useAppStore } from '@/stores/app'
import { formatTimezoneLabel, getTimezoneList } from '@/shared/utils/appProperties'

defineProps<{
  currentTime: string
}>()

const { t } = useI18n()
const i18nStore = useI18nStore()
const themeStore = useThemeStore()
const appStore = useAppStore()

const availableThemes = themeStore.availableThemes

const currentLocale = computed({
  get: () => i18nStore.getLocale(),
  set: (value: Locale) => i18nStore.setLocale(value)
})

const currentTheme = computed({
  get: () => themeStore.currentTheme,
  set: (value: string) => themeStore.setTheme(value)
})

const currentTimeZone = computed({
  get: () => appStore.timeZone,
  set: (value: string) => appStore.changeTimeZone(value)
})

const timezoneList = computed(() => getTimezoneList(currentTimeZone.value))
const systemTimeZone = computed(() => DateTime.local().zoneName)
const systemTimezoneOffset = computed(
  () => formatTimezoneLabel(systemTimeZone.value).split(' | ')[0] ?? ''
)
const currentTimezoneLabel = computed(
  () =>
    timezoneList.value.find((item) => item.value === currentTimeZone.value)?.label ??
    currentTimeZone.value
)
const currentTimezoneOffset = computed(() => currentTimezoneLabel.value.split(' | ')[0] ?? '')
const currentTimezoneName = computed(
  () => currentTimezoneLabel.value.split(' | ')[1] ?? currentTimezoneLabel.value
)

function observesDST(zone: string): boolean {
  const jan = DateTime.fromObject({ month: 1, day: 15 }, { zone }).offset
  const jul = DateTime.fromObject({ month: 7, day: 15 }, { zone }).offset
  return jan !== jul
}

function isDSTNow(zone: string): boolean {
  return DateTime.now().setZone(zone).isInDST
}

function resetToSystemTimezone() {
  currentTimeZone.value = systemTimeZone.value
}
</script>

<template>
  <div class="flex-none flex items-center gap-1 sm:gap-2 min-w-0">
    <div class="hidden md:flex items-center gap-2">
      <div
        class="hidden xl:flex items-center gap-2 px-3 py-1 bg-base-200 rounded-lg text-xs font-mono"
      >
        <span class="text-base-content/60">{{ t('store.timezone.currentTime') }}:</span>
        <span class="font-semibold">{{ currentTime }}</span>
      </div>
      <div class="dropdown dropdown-end header-dropdown header-tz-dropdown">
        <label tabindex="0" class="header-btn-label" :title="t('timezone.select')">
          <span class="header-tz-btn-inner">
            <Clock class="header-action-icon" :size="18" />
            <span class="tz-offset">{{ currentTimezoneOffset }}</span>
            <span class="tz-sep">|</span>
            <span class="tz-zone">{{ currentTimezoneName }}</span>
          </span>
          <ChevronDown class="header-btn-chevron" :size="14" />
        </label>
        <ul
          tabindex="0"
          class="header-dropdown-menu dropdown-content z-[1] mt-2 w-[280px] rounded-box border border-base-300 bg-base-100 p-2 shadow"
        >
          <li>
            <a href="#" class="header-dropdown-item" @click.prevent="resetToSystemTimezone">
              <span class="header-tz-item">
                <RotateCcw class="tz-check tz-check--active" :size="16" />
                <span class="tz-offset">{{ systemTimezoneOffset }}</span>
                <span class="tz-sep">|</span>
                <span class="tz-zone">
                  {{ systemTimeZone }}
                  <span v-if="observesDST(systemTimeZone)">
                    <Sun
                      v-if="isDSTNow(systemTimeZone)"
                      class="tz-dst-icon tz-dst-icon--summer"
                      :size="12"
                    />
                    <Snowflake v-else class="tz-dst-icon tz-dst-icon--winter" :size="12" />
                  </span>
                </span>
              </span>
            </a>
          </li>
          <li v-for="option in timezoneList" :key="option.value">
            <a
              href="#"
              class="header-dropdown-item"
              :class="{ active: option.value === currentTimeZone }"
              @click.prevent="currentTimeZone = option.value"
            >
              <span class="header-tz-item">
                <CircleCheck
                  v-if="option.value === currentTimeZone"
                  class="tz-check tz-check--active"
                  :size="16"
                />
                <Circle v-else class="tz-check" :size="16" />
                <span class="tz-offset">{{ option.label.split(' | ')[0] }}</span>
                <span class="tz-sep">|</span>
                <span class="tz-zone">
                  {{ option.label.split(' | ')[1] ?? option.label }}
                  <span v-if="observesDST(option.value)">
                    <Sun
                      v-if="isDSTNow(option.value)"
                      class="tz-dst-icon tz-dst-icon--summer"
                      :size="12"
                    />
                    <Snowflake v-else class="tz-dst-icon tz-dst-icon--winter" :size="12" />
                  </span>
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
      <select
        v-model="currentTheme"
        class="select select-bordered select-sm h-8 text-xs w-[130px] lg:w-[150px]"
        :title="t('theme.select')"
      >
        <option v-for="theme in availableThemes" :key="theme" :value="theme">
          {{ t(`theme.${theme}`) || theme }}
        </option>
      </select>
      <select
        v-model="currentLocale"
        class="select select-bordered select-sm h-8 text-xs w-[110px] lg:w-[120px]"
        :title="t('language.select')"
      >
        <option value="zh_TW">{{ t('language.zh_TW') }}</option>
        <option value="en_US">{{ t('language.en_US') }}</option>
      </select>
    </div>

    <div class="dropdown dropdown-end md:hidden">
      <label tabindex="0" class="btn btn-ghost btn-sm btn-square" :title="t('layout.mode')">
        <PanelLeft class="h-5 w-5" />
      </label>
      <ul
        tabindex="0"
        class="mt-3 z-[1] p-3 shadow menu menu-sm dropdown-content bg-base-100 rounded-box w-72 border border-base-200 gap-2"
      >
        <li class="menu-title px-1 py-0">
          <span>{{ t('layout.mode') }}</span>
        </li>
        <li class="px-1 text-xs text-base-content/70">
          {{ t('store.timezone.currentTime') }}: {{ currentTime }}
        </li>
        <li>
          <div class="px-1 pb-1 text-[11px] text-base-content/60">{{ t('timezone.select') }}</div>
          <select
            v-model="currentTimeZone"
            class="select select-bordered select-sm w-full"
            :title="t('timezone.select')"
          >
            <option v-for="tz in timezoneList" :key="tz.value" :value="tz.value">
              {{ tz.label }}
            </option>
          </select>
        </li>
        <li>
          <div class="px-1 pb-1 text-[11px] text-base-content/60">{{ t('theme.select') }}</div>
          <select
            v-model="currentTheme"
            class="select select-bordered select-sm w-full"
            :title="t('theme.select')"
          >
            <option v-for="theme in availableThemes" :key="theme" :value="theme">
              {{ t(`theme.${theme}`) || theme }}
            </option>
          </select>
        </li>
        <li>
          <div class="px-1 pb-1 text-[11px] text-base-content/60">{{ t('language.select') }}</div>
          <select
            v-model="currentLocale"
            class="select select-bordered select-sm w-full"
            :title="t('language.select')"
          >
            <option value="zh_TW">{{ t('language.zh_TW') }}</option>
            <option value="en_US">{{ t('language.en_US') }}</option>
          </select>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.header-btn-label {
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 2.125rem;
  padding: 0 0.5rem 0 0.75rem;
  border: 0;
  border-radius: 9999px;
  background: color-mix(in srgb, var(--color-base-300) 55%, transparent);
  color: color-mix(in srgb, var(--color-base-content) 72%, transparent);
  cursor: pointer;
}

.header-btn-label:hover {
  color: var(--color-base-content);
  background: color-mix(in srgb, var(--color-base-300) 80%, transparent);
}

.header-tz-dropdown {
  width: 280px;
}

.header-tz-btn-inner {
  display: grid;
  grid-template-columns: 20px 54px 14px 1fr;
  align-items: center;
  width: 100%;
  font-size: 12px;
}

.header-action-icon {
  opacity: 0.85;
}

.header-btn-chevron {
  margin-left: 0.375rem;
  opacity: 0.7;
  transition: transform 0.2s ease;
}

.header-tz-dropdown:hover .header-btn-chevron {
  transform: rotate(180deg);
}

.header-dropdown-item {
  display: flex;
  width: 100%;
  align-items: center;
  border-radius: 0.5rem;
  padding: 0.375rem 0.5rem;
  font-size: 12px;
  color: color-mix(in srgb, var(--color-base-content) 78%, transparent);
}

.header-dropdown-item:hover {
  background: color-mix(in srgb, var(--color-base-300) 70%, transparent);
}

.header-dropdown-item.active {
  background: color-mix(in srgb, var(--color-primary) 12%, transparent);
  color: var(--color-primary);
}

.header-tz-item {
  display: grid;
  width: 100%;
  grid-template-columns: 20px 54px 14px 1fr;
  align-items: center;
}

.tz-check {
  opacity: 0.45;
}

.tz-check--active {
  opacity: 1;
}

.tz-offset {
  padding-left: 4px;
}

.tz-sep {
  text-align: center;
  opacity: 0.6;
}

.tz-zone {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.tz-dst-icon {
  opacity: 0.8;
}

.tz-dst-icon--summer {
  color: #d49400;
}

.tz-dst-icon--winter {
  color: #4a90d9;
}
</style>
