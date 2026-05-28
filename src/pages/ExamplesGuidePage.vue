<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { Card, PageHeader, Button } from '@/shared/components'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('examples.guide.title')" :subtitle="t('examples.guide.subtitle')" />

    <!-- 定義 -->
    <Card class="mb-8">
      <h2 class="text-xl font-bold mb-3 text-base-content">
        {{ t('examples.guide.definition.title') }}
      </h2>
      <p class="text-base-content/80 mb-3">{{ t('examples.guide.definition.content') }}</p>
      <ul class="list-disc list-inside space-y-1 text-sm text-base-content/70">
        <li>{{ t('examples.guide.definition.feature1') }}</li>
        <li>{{ t('examples.guide.definition.feature2') }}</li>
        <li>{{ t('examples.guide.definition.feature3') }}</li>
        <li>{{ t('examples.guide.definition.feature4') }}</li>
      </ul>
    </Card>

    <!-- 實例列表 -->
    <section class="mb-8" aria-labelledby="examples-list-heading">
      <h2 id="examples-list-heading" class="text-xl font-bold mb-4 text-base-content">
        {{ t('examples.guide.list.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card :title="t('page.api')" :subtitle="t('api.subtitle')">
          <RouterLink to="/examples/api" class="block mt-2">
            <Button variant="primary" class="w-full">{{ t('ui.goTo') }} {{ t('page.api') }}</Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.form')" :subtitle="t('form.subtitle')">
          <RouterLink to="/examples/form" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.form') }}</Button
            >
          </RouterLink>
        </Card>
        <Card :title="t('page.store')" :subtitle="t('store.subtitle')">
          <RouterLink to="/examples/store" class="block mt-2">
            <Button variant="primary" class="w-full"
              >{{ t('ui.goTo') }} {{ t('page.store') }}</Button
            >
          </RouterLink>
        </Card>
      </div>
    </section>
  </div>
</template>
