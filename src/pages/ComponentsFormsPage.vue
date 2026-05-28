<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Card,
  PageHeader,
  Input,
  FileInput,
  Select,
  Textarea,
  DatePicker,
  type SelectOption
} from '@/shared/components'

const { t } = useI18n()
const inputValue = ref('')
const inputWithStatus = ref('')
const selectValue = ref<string | number>('')
const selectOptions = computed<SelectOption[]>(() => [
  { value: '1', label: t('ui.option') + ' 1' },
  { value: '2', label: t('ui.option') + ' 2' },
  { value: '3', label: t('ui.option') + ' 3', disabled: true },
  { value: '4', label: t('ui.option') + ' 4' }
])
const fileValue = ref<File | null>(null)
const filesValue = ref<File[]>([])
const textareaValue = ref('')
const dateValue = ref('')
const datetimeValue = ref('')
const timeValue = ref('')
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components.forms')" :subtitle="t('components.subtitle')" />

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.input.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.input.desc') }}</p>
      <div class="space-y-4 max-w-md">
        <Input
          v-model="inputValue"
          :label="t('components.input.basic')"
          :placeholder="t('components.input.basic.placeholder')"
        />
        <Input
          v-model="inputWithStatus"
          :label="t('components.input.withStatus')"
          :placeholder="t('components.input.withStatus.placeholder')"
          status="pass"
          :status-message="t('components.input.status.pass')"
        />
        <Input
          :label="t('components.input.error')"
          placeholder="test@example.com"
          status="fail"
          :status-message="t('components.input.status.fail')"
        />
        <Input
          :label="t('components.input.disabled')"
          :placeholder="t('components.input.disabled.placeholder')"
          disabled
        />
      </div>
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.select.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.select.desc') }}</p>
      <div class="space-y-4 max-w-md">
        <Select
          v-model="selectValue"
          :label="t('components.select.basic')"
          :placeholder="t('components.select.basic.placeholder')"
          :options="selectOptions"
        />
        <Select
          v-model="selectValue"
          :label="t('components.select.withStatus')"
          :placeholder="t('components.select.basic.placeholder')"
          :options="selectOptions"
          status="pass"
          :status-message="t('components.select.status.success')"
        />
        <Select
          :label="t('components.select.disabled')"
          :placeholder="t('components.select.disabled.placeholder')"
          :options="selectOptions"
          disabled
        />
      </div>
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.fileinput.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.fileinput.desc') }}</p>
      <div class="space-y-4 max-w-md">
        <FileInput
          v-model="fileValue"
          :label="t('components.fileinput.single')"
          :placeholder="t('components.fileinput.single.placeholder')"
          accept="image/*"
        />
        <FileInput
          v-model="filesValue"
          :label="t('components.fileinput.multiple')"
          :placeholder="t('components.fileinput.multiple.placeholder')"
          accept="image/*"
          multiple
        />
        <FileInput
          :label="t('components.fileinput.disabled')"
          :placeholder="t('components.select.disabled.placeholder')"
          disabled
        />
      </div>
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.textarea.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.textarea.desc') }}</p>
      <div class="space-y-4 max-w-md">
        <Textarea
          v-model="textareaValue"
          :label="t('components.textarea.basic')"
          :placeholder="t('components.textarea.basic.placeholder')"
          :rows="4"
        />
        <Textarea
          v-model="textareaValue"
          :label="t('components.textarea.withStatus')"
          :placeholder="t('components.textarea.basic.placeholder')"
          status="pass"
          :status-message="t('components.textarea.status.success')"
          :rows="4"
        />
        <Textarea
          :label="t('components.textarea.disabled')"
          :placeholder="t('components.select.disabled.placeholder')"
          disabled
          :rows="4"
        />
      </div>
    </Card>

    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.datepicker.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.datepicker.desc') }}</p>
      <div class="space-y-4 max-w-md">
        <DatePicker v-model="dateValue" :label="t('components.datepicker.date')" type="date" />
        <DatePicker
          v-model="datetimeValue"
          :label="t('components.datepicker.datetime')"
          type="datetime-local"
        />
        <DatePicker v-model="timeValue" :label="t('components.datepicker.time')" type="time" />
        <DatePicker :label="t('components.datepicker.disabled')" type="date" disabled />
      </div>
    </Card>
  </div>
</template>
