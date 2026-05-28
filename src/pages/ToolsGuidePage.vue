<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Card, PageHeader, Button } from '@/shared/components'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('tools.guide.title')" :subtitle="t('tools.guide.subtitle')" />

    <!-- 定義 -->
    <Card class="mb-8">
      <h2 class="text-xl font-bold mb-3 text-base-content">
        {{ t('tools.guide.definition.title') }}
      </h2>
      <p class="text-base-content/80 mb-3">{{ t('tools.guide.definition.content') }}</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-base-content/70">
        <li>{{ t('tools.guide.definition.feature1') }}</li>
        <li>{{ t('tools.guide.definition.feature2') }}</li>
        <li>{{ t('tools.guide.definition.feature3') }}</li>
        <li>{{ t('tools.guide.definition.feature4') }}</li>
      </ul>
    </Card>

    <!-- 工具列表 -->
    <section class="mb-8" aria-labelledby="tools-list-heading">
      <h2 id="tools-list-heading" class="text-xl font-bold mb-4 text-base-content">
        {{ t('tools.guide.list.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card :title="t('page.files')" :subtitle="t('file.subtitle')">
          <RouterLink to="/tools/files" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.files') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.format')" :subtitle="t('format.subtitle')">
          <RouterLink to="/tools/format" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.format') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.validation')" :subtitle="t('validation.subtitle')">
          <RouterLink to="/tools/validation" class="block mt-2">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.validation') }}
            </Button>
          </RouterLink>
        </Card>
      </div>
    </section>
  </div>
</template>
