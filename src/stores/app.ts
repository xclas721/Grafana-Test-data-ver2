import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'
import { computed, ref } from 'vue'
import { DateTime } from 'luxon'
import { getBrowserTimeZone } from '@/shared/utils/appProperties'

export const useAppStore = defineStore('app', () => {
  // 語系由 i18nStore 管理；本 store 負責時區與應用狀態
  // 時區（使用 useStorage 持久化，首次預設採用瀏覽器時區）
  const timeZone = useStorage('timeZone', getBrowserTimeZone())

  // 舊資料或無效時區值時，自動回退到瀏覽器時區
  if (!DateTime.now().setZone(timeZone.value).isValid) {
    timeZone.value = getBrowserTimeZone()
  }
  // 控制側邊欄收縮狀態
  const isCollapsed = ref(false)
  // 開始時間間隔（當前時間 - startDate）
  const startDate = ref(1)
  // 時間單位：'day' | 'hour' | 'month'
  const dateUnit = ref<string>('month')

  /**
   * 計算動態日期
   * @param offset 偏移量
   * @param unit 單位（day/hour/month）
   */
  const getDynamicDate = (offset: number, unit: string) => {
    return DateTime.now()
      .setZone(timeZone.value)
      .minus({ [unit]: offset })
      .toFormat('yyyy-MM-dd HH:mm:ss')
  }

  /**
   * 開始日期（計算屬性）
   */
  const getStartDate = computed(() => getDynamicDate(startDate.value, dateUnit.value))

  /**
   * 結束日期（當前時間，計算屬性）
   */
  const getEndDate = computed(() =>
    DateTime.now().setZone(timeZone.value).toFormat('yyyy-MM-dd HH:mm:ss')
  )

  /**
   * 切換時區
   */
  function changeTimeZone(val: string) {
    timeZone.value = val
  }

  /**
   * 切換側邊欄狀態
   */
  const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    timeZone,
    startDate,
    dateUnit,
    isCollapsed,
    getStartDate,
    getEndDate,
    changeTimeZone,
    toggleSidebar
  }
})
