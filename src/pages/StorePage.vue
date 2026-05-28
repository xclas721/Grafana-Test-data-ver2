<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DateTime } from 'luxon'
import { Button, Card, PageHeader, Select, type SelectOption } from '@/shared/components'
import { useLoadingStore } from '@/stores/loading'
import { useAppStore } from '@/stores/app'
import { useThemeStore } from '@/stores/theme'
import { useI18nStore } from '@/stores/i18n'
import { getTimezoneList } from '@/shared/utils/appProperties'

const { t } = useI18n()
const loadingStore = useLoadingStore()
const appStore = useAppStore()
const themeStore = useThemeStore()
const i18nStore = useI18nStore()

// ===== Store 展示 =====
const testLoading = () => {
  loadingStore.startLoading(t('store.loading.test'))
  setTimeout(() => {
    loadingStore.finishLoading()
  }, 2000)
}

// 主題選項
const themeOptions = computed<SelectOption[]>(() =>
  themeStore.availableThemes.map((theme) => ({
    value: theme,
    label: t(`theme.${theme}`) || theme
  }))
)

const currentTheme = computed({
  get: () => themeStore.currentTheme,
  set: (value) => themeStore.setTheme(value as string)
})

// 時區選項（與 MainLayout 一致）
const timezoneOptions = computed<SelectOption[]>(() =>
  getTimezoneList(appStore.timeZone).map((tz) => ({
    value: tz.value,
    label: tz.label
  }))
)

const currentTimezone = computed({
  get: () => appStore.timeZone,
  set: (value) => {
    appStore.changeTimeZone(value as string)
  }
})

// 語言選項
const languageOptions = computed<SelectOption[]>(() => [
  { value: 'zh_TW', label: t('language.zh_TW') },
  { value: 'en_US', label: t('language.en_US') }
])

const currentLanguage = computed({
  get: () => i18nStore.getLocale(),
  set: (value) => {
    i18nStore.setLocale(value as 'zh_TW' | 'en_US')
  }
})

// 當前時間（實時更新）
const currentTime = ref('')
let timeInterval: number | null = null

const updateCurrentTime = () => {
  currentTime.value = DateTime.now().setZone(appStore.timeZone).toFormat('yyyy-MM-dd HH:mm:ss')
}

// 監聽時區變化，立即更新時間
watch(
  () => appStore.timeZone,
  () => {
    updateCurrentTime()
  }
)

onMounted(() => {
  updateCurrentTime()
  // 每秒更新一次
  timeInterval = window.setInterval(updateCurrentTime, 1000)
})

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval)
  }
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.store')" :subtitle="t('store.subtitle')" />

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Loading Store -->
      <Card :title="t('store.loading.title')" :subtitle="t('store.loading.desc')">
        <div class="space-y-4">
          <Button variant="primary" @click="testLoading">
            {{ t('store.loading.test') }}
          </Button>
          <div v-if="loadingStore.loading" class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-2">{{ t('store.loading.status') }}</div>
            <div class="flex items-center gap-2">
              <span class="loading loading-spinner loading-sm"></span>
              <span>{{ loadingStore.message || t('store.loading.message') }}</span>
            </div>
          </div>
        </div>
      </Card>

      <!-- Theme Store -->
      <Card :title="t('store.theme.title')" :subtitle="t('store.theme.subtitle')">
        <div class="space-y-4">
          <Select v-model="currentTheme" :label="t('store.theme.select')" :options="themeOptions" />
          <Button variant="outline" size="sm" @click="themeStore.nextTheme">
            {{ t('store.theme.next') }}
          </Button>
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">{{ t('store.theme.current') }}</div>
            <div class="font-mono">{{ themeStore.currentTheme }}</div>
          </div>
        </div>
      </Card>

      <!-- Timezone Store -->
      <Card :title="t('store.timezone.title')" :subtitle="t('store.timezone.subtitle')">
        <div class="space-y-4">
          <Select
            v-model="currentTimezone"
            :label="t('store.timezone.select')"
            :options="timezoneOptions"
          />
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">
              {{ t('store.app.timezone') }}
            </div>
            <div class="font-mono">{{ appStore.timeZone }}</div>
          </div>
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">
              {{ t('store.timezone.currentTime') }}
            </div>
            <div class="font-mono text-lg font-semibold">{{ currentTime }}</div>
          </div>
        </div>
      </Card>

      <!-- Language Store -->
      <Card :title="t('store.language.title')" :subtitle="t('store.language.subtitle')">
        <div class="space-y-4">
          <Select
            v-model="currentLanguage"
            :label="t('store.language.select')"
            :options="languageOptions"
          />
          <div class="bg-base-200 p-3 rounded-lg">
            <div class="text-sm text-base-content/70 mb-1">
              {{ t('store.app.language') }}
            </div>
            <div class="font-mono">{{ i18nStore.getLocale() }}</div>
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
