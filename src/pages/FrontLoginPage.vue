<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button, Card, Input } from '@/shared/components'
import { useFrontAuthStore } from '@/stores/frontAuth'
import { authService } from '@/shared/services/authService'
import { message } from '@/shared/utils/message'

const route = useRoute()
const router = useRouter()
const frontAuthStore = useFrontAuthStore()
const { t } = useI18n()
const username = ref('demo')
const password = ref('123456')
const isSubmitting = ref(false)

const redirectPath = computed(() => {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') ? redirect : '/front'
})

const goHome = () => router.push('/')

const loginAndContinue = async (payload: { username: string; password: string }) => {
  if (!payload.username || !payload.password) {
    await message.warn(t('auth.warn.required'))
    return
  }

  isSubmitting.value = true
  try {
    const result = await authService.frontLogin(payload)
    frontAuthStore.setToken(result.token ?? null)
    await router.replace(redirectPath.value)
  } catch (error) {
    const res = authService.getLoginErrorMessage(error)
    await message.error(res.params ? t(res.key, res.params) : t(res.key))
  } finally {
    isSubmitting.value = false
  }
}

const submitLogin = async () => {
  await loginAndContinue({ username: username.value.trim(), password: password.value })
}
</script>

<template>
  <div
    class="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-base-200/60 px-4 py-8 sm:py-12"
  >
    <Card
      class="max-w-md w-full border border-base-300/60 bg-base-100/95 shadow-xl backdrop-blur-sm"
    >
      <div class="space-y-6 p-1 sm:p-2">
        <div class="text-center space-y-2">
          <h1 class="text-2xl sm:text-3xl font-bold tracking-tight">
            {{ t('front.login.title') }}
          </h1>
          <p class="text-sm sm:text-base text-base-content/60">
            {{ t('front.login.description') }}
          </p>
        </div>

        <div class="w-full space-y-3 text-left">
          <Input
            v-model="username"
            :label="t('ui.login.username')"
            :placeholder="t('ui.login.usernamePlaceholder')"
            :disabled="isSubmitting"
          />
          <Input
            v-model="password"
            :label="t('ui.login.password')"
            type="password"
            :placeholder="t('ui.login.passwordPlaceholder')"
            :disabled="isSubmitting"
          />
        </div>

        <p class="text-xs text-base-content/60">
          {{ t('auth.demoAccount') }}
        </p>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button variant="primary" class="w-full" :disabled="isSubmitting" @click="submitLogin">
            {{ isSubmitting ? t('ui.login.submitting') : t('front.login.submitButton') }}
          </Button>
          <Button variant="ghost" class="w-full" @click="goHome">
            {{ t('error.401.backHome') }}
          </Button>
        </div>
      </div>
    </Card>
  </div>
</template>
