<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { Button, Card } from '@/shared/components'

const router = useRouter()
const { t } = useI18n()

const goHome = () => router.push('/')
const goLogin = () => router.push('/login')
const reload = () => window.location.reload()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 px-4">
    <Card class="max-w-md w-full text-center">
      <div class="flex flex-col items-center gap-6 py-8">
        <!-- 500 圖示 -->
        <div class="text-9xl font-bold text-error/20">500</div>

        <!-- 標題 -->
        <h1 class="text-3xl font-bold">{{ t('error.500.title') }}</h1>

        <!-- 描述 -->
        <p class="text-base-content/60">{{ t('error.500.description') }}</p>

        <!-- 操作按鈕 -->
        <div class="flex flex-wrap justify-center gap-3">
          <Button variant="primary" @click="goLogin">{{ t('error.401.goLogin') }}</Button>
          <Button variant="outline" @click="reload">{{ t('error.500.reload') }}</Button>
          <Button variant="ghost" @click="goHome">{{ t('error.500.backHome') }}</Button>
        </div>
      </div>
    </Card>
  </div>
</template>
