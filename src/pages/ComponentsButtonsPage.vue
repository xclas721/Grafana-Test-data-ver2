<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader } from '@/shared/components'
import { message } from '@/shared/utils/message'

const { t } = useI18n()
const loadingButtons = ref<Record<string, boolean>>({})

const triggerLoading = (key: string) => {
  loadingButtons.value[key] = true
  setTimeout(() => {
    loadingButtons.value[key] = false
  }, 2000)
}
const showSuccess = () => message.success(t('components.message.success.example'))
const showInfo = () => message.info(t('components.message.info.example'))
const showWarning = () => message.warn(t('components.message.warning.example'))
const showError = () => message.error(t('components.message.error.example'))
const showConfirm = async () => {
  const confirmed = await message.confirm(
    t('components.message.confirm.text'),
    t('components.message.confirm.title')
  )
  if (confirmed) message.success(t('components.message.confirm.confirmed'))
  else message.info(t('components.message.confirm.cancelled'))
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components.buttons')" :subtitle="t('components.subtitle')" />

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.button.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.button.desc') }}</p>
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.variants') }}</h3>
        <div class="flex flex-wrap gap-3">
          <Button variant="primary">{{ t('components.button.primary') }}</Button>
          <Button variant="success">{{ t('components.button.success') }}</Button>
          <Button variant="info">{{ t('components.button.info') }}</Button>
          <Button variant="warning">{{ t('components.button.warning') }}</Button>
          <Button variant="danger">{{ t('components.button.danger') }}</Button>
          <Button variant="outline">{{ t('components.button.outline') }}</Button>
          <Button variant="ghost">{{ t('components.button.ghost') }}</Button>
          <Button variant="link">{{ t('components.button.link') }}</Button>
        </div>
      </div>
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.sizes') }}</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="xs">{{ t('components.button.size.xs') }}</Button>
          <Button variant="primary" size="sm">{{ t('components.button.size.sm') }}</Button>
          <Button variant="primary" size="md">{{ t('components.button.size.md') }}</Button>
          <Button variant="primary" size="lg">{{ t('components.button.size.lg') }}</Button>
        </div>
      </div>
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.states') }}</h3>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            :loading="loadingButtons['loading1']"
            @click="triggerLoading('loading1')"
          >
            {{ t('components.button.loading') }}
          </Button>
          <Button variant="primary" disabled>{{ t('components.button.disabled') }}</Button>
        </div>
      </div>
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.message.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.message.desc') }}</p>
      <div class="flex flex-wrap gap-3">
        <Button variant="success" @click="showSuccess">{{
          t('components.message.success')
        }}</Button>
        <Button variant="info" @click="showInfo">{{ t('components.message.info') }}</Button>
        <Button variant="warning" @click="showWarning">{{
          t('components.message.warning')
        }}</Button>
        <Button variant="danger" @click="showError">{{ t('components.message.error') }}</Button>
        <Button variant="primary" @click="showConfirm">{{
          t('components.message.confirm')
        }}</Button>
      </div>
    </Card>
  </div>
</template>
