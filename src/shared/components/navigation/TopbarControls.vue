<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { DateTime } from 'luxon'
import {
  CalendarClock,
  ChevronDown,
  Circle,
  CircleCheck,
  Clock,
  Globe,
  Moon,
  RotateCcw,
  Snowflake,
  Sun
} from 'lucide-vue-next'
import { useI18nStore } from '@/stores/i18n'
import type { Locale } from '@/stores/i18n'
import { useThemeStore } from '@/stores/theme'
import { useAppStore } from '@/stores/app'
import { formatTimezoneLabel, getTimezoneList } from '@/shared/utils/appProperties'

const { t, locale: i18nLocale } = useI18n()
const i18nStore = useI18nStore()
const themeStore = useThemeStore()
const appStore = useAppStore()

const langOptions: { label: string; value: Locale }[] = [
  { label: '繁體中文', value: 'zh_TW' },
  { label: 'English', value: 'en_US' }
]

const langStr = computed(
  () => langOptions.find((item) => item.value === i18nLocale.value)?.label ?? '繁體中文'
)

const isDarkMode = computed(() => themeStore.isDarkMode())

const timezoneList = computed(() => getTimezoneList(appStore.timeZone))
const systemTimeZone = computed(() => DateTime.local().zoneName)
const systemTimezoneOffset = computed(
  () => formatTimezoneLabel(systemTimeZone.value).split(' | ')[0] ?? ''
)
const currentTimezoneLabel = computed(
  () =>
    timezoneList.value.find((item) => item.value === appStore.timeZone)?.label ?? appStore.timeZone
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
  appStore.changeTimeZone(systemTimeZone.value)
}

function handleChangeTimezone(value: string) {
  appStore.changeTimeZone(value)
}

function handleChangeLanguage(value: Locale) {
  i18nStore.setLocale(value)
}

function toggleTheme() {
  themeStore.toggleTheme()
}

const currentTime = ref('')
let timeInterval: ReturnType<typeof setInterval> | null = null

function updateCurrentTime() {
  currentTime.value = DateTime.now().setZone(appStore.timeZone).toFormat('yyyy-MM-dd HH:mm:ss')
}

watch(() => appStore.timeZone, updateCurrentTime)

/** 觸控裝置：點擊切換 .show（桌面仍以 hover 為主，與 acs 一致） */
const touchOpenMenu = ref<'tz' | 'lang' | null>(null)

function onTzTriggerClick() {
  touchOpenMenu.value = touchOpenMenu.value === 'tz' ? null : 'tz'
}

function onLangTriggerClick() {
  touchOpenMenu.value = touchOpenMenu.value === 'lang' ? null : 'lang'
}

function onDocumentPointerDown(event: PointerEvent) {
  if (!touchOpenMenu.value) return
  const target = event.target
  if (!(target instanceof Node)) return
  const tzRoot = document.getElementById('timezoneDropdown')?.closest('.header-dropdown')
  const langRoot = document.getElementById('languageDropdown')?.closest('.header-dropdown')
  if (touchOpenMenu.value === 'tz' && tzRoot && !tzRoot.contains(target)) {
    touchOpenMenu.value = null
  }
  if (touchOpenMenu.value === 'lang' && langRoot && !langRoot.contains(target)) {
    touchOpenMenu.value = null
  }
}

onMounted(() => {
  updateCurrentTime()
  timeInterval = setInterval(updateCurrentTime, 1000)
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onUnmounted(() => {
  if (timeInterval !== null) {
    clearInterval(timeInterval)
  }
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})
</script>

<template>
  <ul class="header-nav header-actions">
    <li class="nav-item">
      <div class="header-dropdown header-tz-dropdown" :class="{ show: touchOpenMenu === 'tz' }">
        <button
          id="timezoneDropdown"
          type="button"
          class="header-btn-label"
          aria-haspopup="true"
          :aria-expanded="touchOpenMenu === 'tz'"
          :title="currentTimezoneLabel"
          @click="onTzTriggerClick"
        >
          <span class="header-tz-btn-inner">
            <Clock class="header-action-icon" :size="20" />
            <span class="tz-offset">{{ currentTimezoneOffset }}</span>
            <span class="tz-sep">|</span>
            <span class="tz-zone">
              <span class="tz-zone-text">{{ currentTimezoneName }}</span>
              <span
                v-if="observesDST(appStore.timeZone)"
                :title="isDSTNow(appStore.timeZone) ? t('timezone.dst') : t('timezone.st')"
              >
                <Sun
                  v-if="isDSTNow(appStore.timeZone)"
                  class="tz-dst-icon tz-dst-icon--summer"
                  :size="13"
                />
                <Snowflake v-else class="tz-dst-icon tz-dst-icon--winter" :size="13" />
              </span>
            </span>
          </span>
          <ChevronDown class="header-btn-chevron" :size="14" />
        </button>
        <ul
          class="header-dropdown-menu header-dropdown-menu-scroll dropdown-menu-end"
          aria-labelledby="timezoneDropdown"
        >
          <li>
            <a
              href="#"
              class="header-dropdown-item header-tz-reset-item"
              @click.prevent="resetToSystemTimezone"
            >
              <span class="header-tz-item">
                <RotateCcw class="tz-check" :size="18" />
                <span class="tz-offset">{{ systemTimezoneOffset }}</span>
                <span class="tz-sep">|</span>
                <span class="tz-zone">
                  <span class="tz-zone-text">{{ systemTimeZone }}</span>
                  <span
                    v-if="observesDST(systemTimeZone)"
                    :title="isDSTNow(systemTimeZone) ? t('timezone.dst') : t('timezone.st')"
                  >
                    <Sun
                      v-if="isDSTNow(systemTimeZone)"
                      class="tz-dst-icon tz-dst-icon--summer"
                      :size="13"
                    />
                    <Snowflake v-else class="tz-dst-icon tz-dst-icon--winter" :size="13" />
                  </span>
                </span>
              </span>
            </a>
          </li>
          <li v-for="option in timezoneList" :key="option.value">
            <a
              href="#"
              class="header-dropdown-item"
              :class="{ active: option.value === appStore.timeZone }"
              @click.prevent="handleChangeTimezone(option.value)"
            >
              <span class="header-tz-item">
                <CircleCheck
                  v-if="option.value === appStore.timeZone"
                  class="tz-check tz-check--active"
                  :size="18"
                />
                <Circle v-else class="tz-check" :size="18" />
                <span class="tz-offset">{{ option.label.split(' | ')[0] }}</span>
                <span class="tz-sep">|</span>
                <span class="tz-zone">
                  <span class="tz-zone-text">{{
                    option.label.split(' | ')[1] ?? option.label
                  }}</span>
                  <span
                    v-if="observesDST(option.value)"
                    :title="isDSTNow(option.value) ? t('timezone.dst') : t('timezone.st')"
                  >
                    <Sun
                      v-if="isDSTNow(option.value)"
                      class="tz-dst-icon tz-dst-icon--summer"
                      :size="13"
                    />
                    <Snowflake v-else class="tz-dst-icon tz-dst-icon--winter" :size="13" />
                  </span>
                </span>
              </span>
            </a>
          </li>
        </ul>
      </div>
    </li>

    <li class="nav-item header-time-item">
      <div
        class="header-time-display"
        :title="`${t('store.timezone.currentTime')}: ${currentTime}`"
        aria-live="polite"
      >
        <CalendarClock class="header-action-icon header-time-icon" :size="18" />
        <time class="header-time-text" :datetime="currentTime">{{ currentTime }}</time>
      </div>
    </li>

    <li class="nav-item">
      <button
        type="button"
        class="header-theme-switch-btn"
        role="switch"
        :aria-checked="isDarkMode"
        :title="isDarkMode ? t('theme.brainwave-dark') : t('theme.brainwave')"
        @click="toggleTheme"
      >
        <span class="header-theme-switch-thumb" :class="{ 'is-dark': isDarkMode }">
          <Moon v-if="isDarkMode" class="header-theme-icon header-theme-icon--moon" :size="16" />
          <Sun v-else class="header-theme-icon header-theme-icon--sun" :size="16" />
        </span>
      </button>
    </li>

    <li class="nav-item">
      <div class="header-dropdown header-lang-dropdown" :class="{ show: touchOpenMenu === 'lang' }">
        <button
          id="languageDropdown"
          type="button"
          class="header-btn-circle"
          aria-haspopup="true"
          :aria-expanded="touchOpenMenu === 'lang'"
          :title="langStr"
          @click="onLangTriggerClick"
        >
          <Globe class="header-action-icon" :size="20" />
        </button>
        <ul class="header-dropdown-menu dropdown-menu-end" aria-labelledby="languageDropdown">
          <li v-for="option in langOptions" :key="option.value">
            <a
              href="#"
              class="header-dropdown-item header-select-item"
              :class="{ active: option.value === i18nLocale }"
              @click.prevent="handleChangeLanguage(option.value)"
            >
              <CircleCheck
                v-if="option.value === i18nLocale"
                class="tz-check tz-check--active"
                :size="18"
              />
              <Circle v-else class="tz-check" :size="18" />
              <span>{{ option.label }}</span>
            </a>
          </li>
        </ul>
      </div>
    </li>
  </ul>
</template>
