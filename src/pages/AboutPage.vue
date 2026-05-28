<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { PageHeader, Card } from '@/shared/components'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-6 py-12 max-w-4xl">
    <PageHeader :title="t('about.title')" :subtitle="t('about.description')" />

    <div class="flex flex-col gap-8">
      <Card>
        <div class="prose max-w-none">
          <h3 class="text-xl font-bold mb-2">{{ t('about.feature.static') }}</h3>
          <p class="text-base-content/70">{{ t('about.feature.static.desc') }}</p>
        </div>
      </Card>

      <Card>
        <div class="prose max-w-none">
          <h3 class="text-xl font-bold mb-2">{{ t('about.feature.modular') }}</h3>
          <p class="text-base-content/70">{{ t('about.feature.modular.desc') }}</p>
        </div>
      </Card>

      <Card>
        <h3 class="text-xl font-bold mb-4">{{ t('about.feature.tech') }}</h3>
        <div class="flex flex-wrap gap-2">
          <div class="badge badge-lg badge-outline">{{ t('about.tech.vue') }}</div>
          <div class="badge badge-lg badge-outline">{{ t('about.tech.typescript') }}</div>
          <div class="badge badge-lg badge-outline">{{ t('about.tech.vite') }}</div>
          <div class="badge badge-lg badge-outline">{{ t('about.tech.pinia') }}</div>
          <div class="badge badge-lg badge-primary badge-outline">Tailwind CSS</div>
          <div class="badge badge-lg badge-secondary badge-outline">DaisyUI</div>
        </div>
      </Card>
    </div>
  </div>
</template>
