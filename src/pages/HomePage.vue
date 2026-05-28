<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Card, Button } from '@/shared/components'

const { t } = useI18n()
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <!-- 儀表板標題區塊 -->
    <div class="hero bg-base-200/50 rounded-box mb-12">
      <div class="hero-content text-center">
        <div class="max-w-xl">
          <h1 class="text-5xl font-bold text-base-content">{{ t('page.dashboard') }}</h1>
          <p class="py-6 text-lg text-base-content/70">
            {{ t('dashboard.subtitle') }}
          </p>
        </div>
      </div>
    </div>

    <p class="text-base-content/70 mb-8">{{ t('dashboard.quickAccessIntro') }}</p>

    <!-- 管理 -->
    <section class="mb-8" aria-labelledby="dashboard-management">
      <h2 id="dashboard-management" class="text-2xl font-bold mb-6 text-base-content">
        {{ t('home.management.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card :title="t('page.users')" :subtitle="t('user.subtitle')">
          <RouterLink to="/users" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.users') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.members')" :subtitle="t('member.subtitle')">
          <RouterLink to="/members" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.members') }}
            </Button>
          </RouterLink>
        </Card>
      </div>
    </section>

    <!-- 實例 -->
    <section class="mb-8" aria-labelledby="dashboard-examples">
      <h2 id="dashboard-examples" class="text-2xl font-bold mb-6 text-base-content">
        {{ t('home.examples.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card :title="t('page.examples.guide')" :subtitle="t('page.examples')">
          <RouterLink to="/examples" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.examples.guide') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.api')" :subtitle="t('api.subtitle')">
          <RouterLink to="/examples/api" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.api') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.form')" :subtitle="t('form.subtitle')">
          <RouterLink to="/examples/form" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.form') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.store')" :subtitle="t('store.subtitle')">
          <RouterLink to="/examples/store" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.store') }}
            </Button>
          </RouterLink>
        </Card>
      </div>
    </section>

    <!-- 組件 -->
    <section class="mb-8" aria-labelledby="dashboard-components">
      <h2 id="dashboard-components" class="text-2xl font-bold mb-6 text-base-content">
        {{ t('home.components.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card :title="t('page.components.guide')" :subtitle="t('components.subtitle')">
          <RouterLink to="/components/guide" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.components.guide') }}
            </Button>
          </RouterLink>
        </Card>
      </div>
    </section>

    <!-- 工具 -->
    <section class="mb-8" aria-labelledby="dashboard-tools">
      <h2 id="dashboard-tools" class="text-2xl font-bold mb-6 text-base-content">
        {{ t('home.tools.title') }}
      </h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card :title="t('page.tools.guide')" :subtitle="t('tools.guide.title')">
          <RouterLink to="/tools" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.tools.guide') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.files')" :subtitle="t('file.subtitle')">
          <RouterLink to="/tools/files" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.files') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.format')" :subtitle="t('format.subtitle')">
          <RouterLink to="/tools/format" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.format') }}
            </Button>
          </RouterLink>
        </Card>
        <Card :title="t('page.validation')" :subtitle="t('validation.subtitle')">
          <RouterLink to="/tools/validation" class="block">
            <Button variant="primary" class="w-full">
              {{ t('ui.goTo') }} {{ t('page.validation') }}
            </Button>
          </RouterLink>
        </Card>
      </div>
    </section>
  </div>
</template>
