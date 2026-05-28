<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  Button,
  Card,
  PageHeader,
  Input,
  Pagination,
  DataTable,
  Modal,
  FileInput,
  Select,
  Textarea,
  DatePicker,
  type Column,
  type SelectOption
} from '@/shared/components'
import { message } from '@/shared/utils/message'

const { t } = useI18n()

// 按鈕載入狀態
const loadingButtons = ref<Record<string, boolean>>({})

// Input 狀態
const inputValue = ref('')
const inputWithStatus = ref('')

// Pagination 狀態
const paginationCurrentPage = ref(1)
const paginationPageSize = ref(10)
const paginationTotal = ref(100)
const paginationTotalPages = ref(10)

// Modal 狀態
const showModal = ref(false)
const showModalLarge = ref(false)

// Select 狀態
const selectValue = ref<string | number>('')
const selectOptions = computed<SelectOption[]>(() => [
  { value: '1', label: t('ui.option') + ' 1' },
  { value: '2', label: t('ui.option') + ' 2' },
  { value: '3', label: t('ui.option') + ' 3', disabled: true },
  { value: '4', label: t('ui.option') + ' 4' }
])

// FileInput 狀態
const fileValue = ref<File | null>(null)
const filesValue = ref<File[]>([])

// Textarea 狀態
const textareaValue = ref('')

// DatePicker 狀態
const dateValue = ref('')
const datetimeValue = ref('')
const timeValue = ref('')

// DataTable 狀態
interface TableData {
  id: number
  name: string
  email: string
  role: string
  status: string
}

const tableData = computed<TableData[]>(() => [
  {
    id: 1,
    name: '張三',
    email: 'zhang@example.com',
    role: t('components.datatable.demo.role.admin'),
    status: t('components.datatable.demo.status.enabled')
  },
  {
    id: 2,
    name: '李四',
    email: 'li@example.com',
    role: t('components.datatable.demo.role.user'),
    status: t('components.datatable.demo.status.enabled')
  },
  {
    id: 3,
    name: '王五',
    email: 'wang@example.com',
    role: t('components.datatable.demo.role.user'),
    status: t('components.datatable.demo.status.disabled')
  },
  {
    id: 4,
    name: '趙六',
    email: 'zhao@example.com',
    role: t('components.datatable.demo.role.editor'),
    status: t('components.datatable.demo.status.enabled')
  },
  {
    id: 5,
    name: '錢七',
    email: 'qian@example.com',
    role: t('components.datatable.demo.role.user'),
    status: t('components.datatable.demo.status.enabled')
  }
])

const tableColumns = computed<Column<TableData>[]>(() => [
  { key: 'id', label: 'ID', width: '80px', sortable: true },
  { key: 'name', label: t('components.datatable.demo.name'), sortable: true },
  { key: 'email', label: 'Email' },
  { key: 'role', label: t('components.datatable.demo.role') },
  { key: 'status', label: t('components.datatable.demo.status') }
])

const tableCurrentPage = ref(1)
const tablePageSize = ref(10)
const tableTotal = ref(5)
const tableTotalPages = ref(1)

/**
 * 觸發按鈕載入狀態
 */
const triggerLoading = (key: string) => {
  loadingButtons.value[key] = true
  setTimeout(() => {
    loadingButtons.value[key] = false
  }, 2000)
}

/**
 * 顯示成功訊息
 */
const showSuccess = () => {
  message.success(t('components.message.success.example'))
}

/**
 * 顯示提示訊息
 */
const showInfo = () => {
  message.info(t('components.message.info.example'))
}

/**
 * 顯示警告訊息
 */
const showWarning = () => {
  message.warn(t('components.message.warning.example'))
}

/**
 * 顯示錯誤訊息
 */
const showError = () => {
  message.error(t('components.message.error.example'))
}

/**
 * 顯示確認對話框
 */
const showConfirm = async () => {
  const confirmed = await message.confirm(
    t('components.message.confirm.text'),
    t('components.message.confirm.title')
  )
  if (confirmed) {
    message.success(t('components.message.confirm.confirmed'))
  } else {
    message.info(t('components.message.confirm.cancelled'))
  }
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components')" :subtitle="t('components.subtitle')" />

    <!-- 按鈕組件展示 -->
    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.button.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.button.desc') }}</p>

      <!-- 按鈕變體 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.variants') }}</h3>
        <div class="flex flex-wrap gap-3">
          <Button variant="primary">{{ t('components.button.primary') }}</Button>
          <Button variant="success">{{ t('components.button.success') }}</Button>
          <Button variant="info">{{ t('components.button.info') }}</Button>
          <Button variant="warning">{{ t('components.button.warning') }}</Button>
          <Button variant="danger">{{ t('components.button.danger') }}</Button>
          <Button variant="outline">{{ t('components.button.outline') }}</Button>
          <Button variant="ghost">{{ t('components.button.ghost') }}</Button>
          <Button variant="link">{{ t('components.button.link') }}</Button>
        </div>
      </div>

      <!-- 按鈕尺寸 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.sizes') }}</h3>
        <div class="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="xs">{{ t('components.button.size.xs') }}</Button>
          <Button variant="primary" size="sm">{{ t('components.button.size.sm') }}</Button>
          <Button variant="primary" size="md">{{ t('components.button.size.md') }}</Button>
          <Button variant="primary" size="lg">{{ t('components.button.size.lg') }}</Button>
        </div>
      </div>

      <!-- 按鈕狀態 -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold mb-3">{{ t('components.button.states') }}</h3>
        <div class="flex flex-wrap gap-3">
          <Button
            variant="primary"
            :loading="loadingButtons['loading1']"
            @click="triggerLoading('loading1')"
          >
            {{ t('components.button.loading') }}
          </Button>
          <Button variant="primary" disabled>{{ t('components.button.disabled') }}</Button>
        </div>
      </div>
    </Card>

    <!-- 提示訊息展示 -->
    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.message.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.message.desc') }}</p>

      <div class="flex flex-wrap gap-3">
        <Button variant="success" @click="showSuccess">
          {{ t('components.message.success') }}
        </Button>
        <Button variant="info" @click="showInfo">{{ t('components.message.info') }}</Button>
        <Button variant="warning" @click="showWarning">
          {{ t('components.message.warning') }}
        </Button>
        <Button variant="danger" @click="showError">{{ t('components.message.error') }}</Button>
        <Button variant="primary" @click="showConfirm">
          {{ t('components.message.confirm') }}
        </Button>
      </div>
    </Card>

    <!-- Card 組件展示 -->
    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.card.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.card.desc') }}</p>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          :title="t('components.card.example.title')"
          :subtitle="t('components.card.example.subtitle')"
        >
          <p class="text-base-content/70">{{ t('components.card.example.content') }}</p>
        </Card>
        <Card>
          <p class="text-base-content/70">{{ t('components.card.example.noTitle') }}</p>
        </Card>
      </div>
    </Card>

    <!-- Input 組件展示 -->
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

    <!-- Pagination 組件展示 -->
    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.pagination.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.pagination.desc') }}</p>

      <div class="max-w-2xl">
        <Pagination
          :current-page="paginationCurrentPage"
          :page-size="paginationPageSize"
          :total="paginationTotal"
          :total-pages="paginationTotalPages"
          @page-change="(page) => (paginationCurrentPage = page)"
          @size-change="(size) => (paginationPageSize = size)"
        />
      </div>
    </Card>

    <!-- Modal 組件展示 -->
    <Card class="mb-8">
      <h2 class="text-2xl font-bold mb-4">{{ t('components.modal.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.modal.desc') }}</p>

      <div class="flex flex-wrap gap-3">
        <Button variant="primary" @click="showModal = true">{{
          t('components.modal.standard')
        }}</Button>
        <Button variant="info" @click="showModalLarge = true">{{
          t('components.modal.large')
        }}</Button>
      </div>

      <!-- 標準模態框 -->
      <Modal v-model="showModal" :title="t('components.modal.standard.title')" size="md">
        <p class="py-4">{{ t('components.modal.standard.content') }}</p>
        <p class="py-4">{{ t('components.modal.standard.content2') }}</p>
        <template #footer>
          <Button variant="ghost" @click="showModal = false">{{ t('ui.cancel') }}</Button>
          <Button variant="primary" @click="showModal = false">{{ t('ui.confirm') }}</Button>
        </template>
      </Modal>

      <!-- 大型模態框 -->
      <Modal v-model="showModalLarge" :title="t('components.modal.large.title')" size="lg">
        <p class="py-4">{{ t('components.modal.large.content') }}</p>
        <div class="space-y-4">
          <Input
            :label="t('form.example.name')"
            :placeholder="t('form.example.name.placeholder')"
          />
          <Input
            :label="t('form.example.email')"
            :placeholder="t('form.example.email.placeholder')"
          />
          <Textarea
            :label="t('form.example.description')"
            :placeholder="t('form.example.description.placeholder')"
          />
        </div>
        <template #footer>
          <Button variant="ghost" @click="showModalLarge = false">{{ t('ui.cancel') }}</Button>
          <Button variant="primary" @click="showModalLarge = false">{{ t('ui.confirm') }}</Button>
        </template>
      </Modal>
    </Card>

    <!-- Select 組件展示 -->
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

    <!-- FileInput 組件展示 -->
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

    <!-- Textarea 組件展示 -->
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

    <!-- DatePicker 組件展示 -->
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

    <!-- DataTable 組件展示 -->
    <Card>
      <h2 class="text-2xl font-bold mb-4">{{ t('components.datatable.title') }}</h2>
      <p class="text-base-content/60 mb-6">{{ t('components.datatable.desc') }}</p>

      <div class="overflow-x-auto">
        <DataTable
          :columns="tableColumns"
          :data="tableData"
          :current-page="tableCurrentPage"
          :page-size="tablePageSize"
          :total="tableTotal"
          :total-pages="tableTotalPages"
          :actions-label="t('table.actions')"
          :empty-text="t('ui.noData')"
          @page-change="(page) => (tableCurrentPage = page)"
          @size-change="(size) => (tablePageSize = size)"
          @sort="
            (col, dir) =>
              message.info(t('components.datatable.sort', { column: col, direction: dir }))
          "
        />
      </div>
    </Card>
  </div>
</template>
