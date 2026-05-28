<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, PageHeader, Input } from '@/shared/components'
import { validateEmail, validateNumber, validateTel } from '@/shared/utils/validation'

const { t } = useI18n()

// ===== 驗證工具 =====
const numInput = ref('')
const emailInput = ref('')
const telInput = ref('')
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.validation')" :subtitle="t('validation.subtitle')" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card :title="t('validation.title')" :subtitle="t('validation.desc')" class="md:col-span-2">
        <div class="flex flex-col gap-4">
          <Input
            v-model="numInput"
            :label="t('validation.label.number')"
            :placeholder="t('validation.number.placeholder')"
            :status="numInput ? (validateNumber(numInput).result ? 'pass' : 'fail') : null"
            :status-message="
              numInput
                ? validateNumber(numInput).result
                  ? t('validation.pass')
                  : t('validation.fail')
                : ''
            "
          />
          <Input
            v-model="emailInput"
            :label="t('validation.label.email')"
            :placeholder="t('validation.email.placeholder')"
            :status="emailInput ? (validateEmail(emailInput).result ? 'pass' : 'fail') : null"
            :status-message="
              emailInput
                ? validateEmail(emailInput).result
                  ? t('validation.pass')
                  : t('validation.fail')
                : ''
            "
          />
          <Input
            v-model="telInput"
            :label="t('validation.label.tel')"
            :placeholder="t('validation.tel.placeholder')"
            :status="telInput ? (validateTel(telInput).result ? 'pass' : 'fail') : null"
            :status-message="
              telInput
                ? validateTel(telInput).result
                  ? t('validation.pass')
                  : t('validation.fail')
                : ''
            "
          />
        </div>
      </Card>
    </div>
  </div>
</template>
