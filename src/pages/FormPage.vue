<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  PageHeader,
  Input,
  Select,
  Textarea,
  DatePicker,
  type SelectOption
} from '@/shared/components'
import { message } from '@/shared/utils/message'

const { t } = useI18n()

// 表單狀態
const formData = ref({
  name: '',
  email: '',
  role: '',
  description: '',
  date: ''
})

// 表單控制狀態
const formState = ref({
  required: false,
  readonly: false,
  readonlyAll: false,
  hideAll: false
})

const roleOptions = computed<SelectOption[]>(() => [
  { value: 'admin', label: t('form.role.admin') },
  { value: 'user', label: t('form.role.user') },
  { value: 'editor', label: t('form.role.editor') }
])

// ===== 表單控制工具 =====
const toggleRequired = () => {
  formState.value.required = !formState.value.required
  formState.value.readonly = false
  formState.value.readonlyAll = false
  formState.value.hideAll = false
  message.info(
    formState.value.required
      ? t('form.required.desc') + ' - ' + t('form.message.required.set')
      : t('form.message.required.unset')
  )
}

const toggleReadOnly = () => {
  formState.value.readonly = !formState.value.readonly
  formState.value.required = false
  formState.value.readonlyAll = false
  formState.value.hideAll = false
  message.info(
    formState.value.readonly
      ? t('form.readonly.desc') + ' - ' + t('form.message.readonly.set')
      : t('form.message.readonly.unset')
  )
}

const toggleReadOnlyAll = () => {
  formState.value.readonlyAll = !formState.value.readonlyAll
  formState.value.required = false
  formState.value.readonly = false
  formState.value.hideAll = false
  message.info(
    formState.value.readonlyAll
      ? t('form.readonlyall.desc') + ' - ' + t('form.message.readonlyall.set')
      : t('form.message.readonlyall.unset')
  )
}

const toggleHideAll = () => {
  formState.value.hideAll = !formState.value.hideAll
  formState.value.required = false
  formState.value.readonly = false
  formState.value.readonlyAll = false
  message.info(
    formState.value.hideAll
      ? t('form.hide.desc') + ' - ' + t('form.message.hide.set')
      : t('form.message.hide.unset')
  )
}

const resetForm = () => {
  formData.value = {
    name: '',
    email: '',
    role: '',
    description: '',
    date: ''
  }
  formState.value = {
    required: false,
    readonly: false,
    readonlyAll: false,
    hideAll: false
  }
  message.success(t('form.message.reset'))
}

const submitForm = () => {
  if (formState.value.required && !formData.value.name) {
    message.error(t('form.message.required.error'))
    return
  }
  message.success(t('form.message.submit.success', { data: JSON.stringify(formData.value) }))
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.form')" :subtitle="t('form.subtitle')" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 表單控制按鈕 -->
      <Card :title="t('form.title')" :subtitle="t('form.desc')">
        <div class="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            :class="{ 'btn-primary': formState.required }"
            @click="toggleRequired"
          >
            {{ t('form.required.title') }}
            <span v-if="formState.required" class="badge badge-primary badge-sm ml-2">ON</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="{ 'btn-primary': formState.readonly }"
            @click="toggleReadOnly"
          >
            {{ t('form.readonly.title') }}
            <span v-if="formState.readonly" class="badge badge-primary badge-sm ml-2">ON</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="{ 'btn-primary': formState.readonlyAll }"
            @click="toggleReadOnlyAll"
          >
            {{ t('form.readonlyall.title') }}
            <span v-if="formState.readonlyAll" class="badge badge-primary badge-sm ml-2">ON</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            :class="{ 'btn-primary': formState.hideAll }"
            @click="toggleHideAll"
          >
            {{ t('form.hide.title') }}
            <span v-if="formState.hideAll" class="badge badge-primary badge-sm ml-2">ON</span>
          </Button>
        </div>
      </Card>

      <!-- 表單示例 -->
      <Card
        :title="t('form.example.title')"
        :subtitle="t('form.example.subtitle')"
        class="lg:col-span-2"
      >
        <div v-if="!formState.hideAll" class="space-y-4">
          <Input
            v-model="formData.name"
            :label="t('form.example.name')"
            :placeholder="t('form.example.name.placeholder')"
            :required="formState.required"
            :disabled="formState.readonlyAll"
          />
          <Input
            v-model="formData.email"
            :label="t('form.example.email')"
            type="email"
            :placeholder="t('form.example.email.placeholder')"
            :disabled="formState.readonly || formState.readonlyAll"
          />
          <Select
            v-model="formData.role"
            :label="t('form.example.role')"
            :placeholder="t('form.example.role.placeholder')"
            :options="roleOptions"
            :disabled="formState.readonlyAll"
          />
          <DatePicker
            v-model="formData.date"
            :label="t('form.example.date')"
            type="date"
            :disabled="formState.readonlyAll"
          />
          <Textarea
            v-model="formData.description"
            :label="t('form.example.description')"
            :placeholder="t('form.example.description.placeholder')"
            :rows="4"
            :disabled="formState.readonlyAll"
          />

          <div class="flex gap-2 pt-4">
            <Button variant="primary" @click="submitForm">{{ t('ui.submit') }}</Button>
            <Button variant="outline" @click="resetForm">{{ t('ui.reset') }}</Button>
          </div>
        </div>
        <div v-else class="text-center py-12 text-base-content/60">
          {{ t('form.message.hide.all') }}
        </div>
      </Card>
    </div>
  </div>
</template>
