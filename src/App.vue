<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { GlobalLoading } from '@/shared/components'

const hasRenderError = ref(false)
const { t } = useI18n()

onErrorCaptured((error) => {
  console.error('[RenderErrorCaptured]', error)
  hasRenderError.value = true
  return false
})
</script>

<template>
  <template v-if="hasRenderError">
    <main class="min-h-screen flex items-center justify-center p-6">
      <div class="max-w-lg text-center space-y-3">
        <h1 class="text-2xl font-bold">{{ t('error.render.title') }}</h1>
        <p class="text-base-content/70">{{ t('error.render.description') }}</p>
      </div>
    </main>
  </template>
  <template v-else>
    <RouterView />
    <GlobalLoading />
  </template>
</template>
