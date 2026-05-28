<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  PageHeader,
  TooltipWrapper,
  ProgressInline,
  GlobalLoading
} from '@/shared/components'
import { useLoadingStore } from '@/stores/loading'

const { t } = useI18n()
const loadingStore = useLoadingStore()

const progressValue = ref(45)

const triggerGlobalLoading = () => {
  loadingStore.startLoading(t('components.feedback.globalLoading.message'))
  window.setTimeout(() => {
    loadingStore.finishLoading()
  }, 1200)
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components.feedback')" :subtitle="t('components.subtitle')" />

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.feedback.globalLoading.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.feedback.globalLoading.desc') }}</p>
      <Button variant="primary" @click="triggerGlobalLoading">
        {{ t('components.feedback.globalLoading.action') }}
      </Button>
      <GlobalLoading />
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.feedback.tooltip.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.feedback.tooltip.desc') }}</p>
      <div class="flex flex-wrap gap-3">
        <TooltipWrapper :tip="t('components.feedback.tooltip.top')" position="top">
          <Button variant="outline">{{ t('components.feedback.tooltip.top') }}</Button>
        </TooltipWrapper>
        <TooltipWrapper :tip="t('components.feedback.tooltip.right')" position="right">
          <Button variant="outline">{{ t('components.feedback.tooltip.right') }}</Button>
        </TooltipWrapper>
        <TooltipWrapper :tip="t('components.feedback.tooltip.bottom')" position="bottom">
          <Button variant="outline">{{ t('components.feedback.tooltip.bottom') }}</Button>
        </TooltipWrapper>
        <TooltipWrapper :tip="t('components.feedback.tooltip.left')" position="left">
          <Button variant="outline">{{ t('components.feedback.tooltip.left') }}</Button>
        </TooltipWrapper>
      </div>
    </Card>

    <Card>
      <h2 class="text-2xl font-bold mb-4">{{ t('components.feedback.progress.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.feedback.progress.desc') }}</p>
      <div class="space-y-5 max-w-xl">
        <input
          v-model.number="progressValue"
          type="range"
          min="0"
          max="100"
          class="range range-primary"
        />
        <ProgressInline :value="progressValue" tone="primary" />
        <ProgressInline :value="progressValue" tone="success" />
        <ProgressInline :value="progressValue" tone="warning" />
        <ProgressInline :value="progressValue" tone="error" />
      </div>
    </Card>
  </div>
</template>
