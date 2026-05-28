<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Button, Card } from '@/shared/components'
import { useFrontAuthStore } from '@/stores/frontAuth'

const { t } = useI18n()
const router = useRouter()
const frontAuthStore = useFrontAuthStore()

const goToLanding = () => {
  router.push('/')
}

const logout = () => {
  frontAuthStore.logout()
  void router.replace('/')
}
</script>

<template>
  <div class="min-h-screen bg-base-200 flex flex-col items-center justify-center px-6 py-12">
    <Card class="max-w-lg w-full text-center">
      <div class="flex flex-col items-center gap-6 py-8">
        <h1 class="text-3xl font-bold">{{ t('front.home.title') }}</h1>
        <p class="text-base-content/70">{{ t('front.home.welcome') }}</p>
        <div class="flex flex-col sm:flex-row gap-3">
          <Button variant="primary" @click="goToLanding">{{ t('front.home.goLanding') }}</Button>
          <Button variant="ghost" @click="logout">{{ t('ui.logout') }}</Button>
        </div>
      </div>
    </Card>
  </div>
</template>
