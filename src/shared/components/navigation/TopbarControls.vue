<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { PanelLeft } from 'lucide-vue-next'
import { useI18nStore } from '@/stores/i18n'
import type { Locale } from '@/stores/i18n'
import { useThemeStore } from '@/stores/theme'
import { useAppStore } from '@/stores/app'
import { getTimezoneList } from '@/shared/utils/appProperties'

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
      <select
        v-model="currentTimeZone"
        class="select select-bordered select-sm h-8 text-xs w-[170px] lg:w-[182px] xl:w-[194px]"
        :title="t('timezone.select')"
      >
        <option v-for="tz in timezoneList" :key="tz.value" :value="tz.value">
          {{ tz.label }}
        </option>
      </select>
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
