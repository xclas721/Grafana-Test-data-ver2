<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Card, PageHeader, Pagination, DataTable, type Column } from '@/shared/components'
import { message } from '@/shared/utils/message'

const { t } = useI18n()
const paginationCurrentPage = ref(1)
const paginationPageSize = ref(10)
const paginationTotal = ref(100)
const paginationTotalPages = ref(10)

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
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.components.data')" :subtitle="t('components.subtitle')" />

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

    <Card class="mb-8">
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
