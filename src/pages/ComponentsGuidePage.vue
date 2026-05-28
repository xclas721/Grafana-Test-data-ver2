<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Card, PageHeader, Button } from '@/shared/components'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('components.guide.title')" :subtitle="t('components.guide.subtitle')" />

    <!-- 定義 -->
    <Card class="mb-8">
      <h2 class="text-xl font-bold mb-3 text-base-content">
        {{ t('components.guide.definition.title') }}
      </h2>
      <p class="text-base-content/80 mb-3">{{ t('components.guide.definition.content') }}</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-base-content/70">
        <li>{{ t('components.guide.definition.feature1') }}</li>
        <li>{{ t('components.guide.definition.feature2') }}</li>
        <li>{{ t('components.guide.definition.feature3') }}</li>
        <li>{{ t('components.guide.definition.feature4') }}</li>
      </ul>
    </Card>

    <!-- 組件列表 -->
    <section class="mb-8" aria-labelledby="components-list-heading">
      <h2 id="components-list-heading" class="text-xl font-bold mb-4 text-base-content">
        {{ t('components.guide.list.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
        <Card :title="t('page.components.buttons')" :subtitle="t('components.button.title')">
          <RouterLink to="/components/buttons" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.components.buttons') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.components.forms')" :subtitle="t('components.input.title')">
          <RouterLink to="/components/forms" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.components.forms') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.components.data')" :subtitle="t('components.datatable.title')">
          <RouterLink to="/components/data" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.components.data') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.components.modal')" :subtitle="t('components.modal.title')">
          <RouterLink to="/components/modal" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.components.modal') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.components.feedback')" :subtitle="t('components.feedback.title')">
          <RouterLink to="/components/feedback" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.components.feedback') }}</Button
            >
          </RouterLink>
        </Card>
      </div>
    </section>
  </div>
</template>
