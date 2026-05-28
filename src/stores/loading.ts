import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLoadingStore = defineStore('loading', () => {
  const { t } = useI18n()
  const loading = ref(false)
  const message = ref(t('ui.system.loading', '載入中...'))

  function startLoading(msg?: string) {
    loading.value = true
    message.value = msg || t('ui.system.loading', '載入中...')
  }

  function finishLoading() {
    loading.value = false
  }

  function resetLoading() {
    loading.value = false
    message.value = t('ui.system.loading', '載入中...')
  }

  return {
    loading,
    message,
    startLoading,
    finishLoading,
    resetLoading
  }
})
