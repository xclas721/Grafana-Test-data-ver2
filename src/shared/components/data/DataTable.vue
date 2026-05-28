<script setup lang="ts" generic="T extends Record<string, any>">
import { computed } from 'vue'
import { ArrowUpDown } from 'lucide-vue-next'
import { Pagination } from '@/shared/components'

export interface Column<T = any> {
  key: string
  label: string
  width?: string
  sortable?: boolean
  formatter?: (value: any, row: T) => string
}

export interface DataTableProps<T = any> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
  showPagination?: boolean
  showSizeSelector?: boolean
  pageSizeOptions?: number[]
  emptyText?: string
  zebra?: boolean
  stickyHeader?: boolean
  actionsLabel?: string
  mobileCardMode?: boolean
}

const props = withDefaults(defineProps<DataTableProps<T>>(), {
  loading: false,
  showPagination: true,
  showSizeSelector: true,
  pageSizeOptions: () => [10, 20, 50, 100],
  emptyText: '無資料',
  zebra: true,
  stickyHeader: false,
  actionsLabel: '操作',
  mobileCardMode: true
})

const emit = defineEmits<{
  'page-change': [page: number]
  'size-change': [size: number]
  sort: [column: string, direction: 'asc' | 'desc']
}>()

const tableClasses = computed(() => {
  const classes = ['table', 'w-full']
  if (props.zebra) classes.push('table-zebra')
  return classes.join(' ')
})

const handlePageChange = (page: number) => {
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('size-change', size)
}

const handleSort = (column: Column<T>) => {
  if (column.sortable) {
    // 排序邏輯可依需求擴展
    emit('sort', column.key, 'asc')
  }
}

const getCellValue = (row: T, column: Column<T>) => {
  const value = row[column.key]
  if (column.formatter) {
    return column.formatter(value, row)
  }
  return value ?? ''
}

const skeletonRows = computed(() => 5)
</script>

<template>
  <div class="w-full">
    <!-- Loading 狀態 -->
    <div v-if="loading" class="space-y-3">
      <div :class="[props.mobileCardMode ? 'hidden md:block' : 'block', 'overflow-x-auto']">
        <table :class="tableClasses">
          <thead :class="{ 'sticky top-0 z-10 bg-base-200': stickyHeader }">
            <tr>
              <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
                {{ column.label }}
              </th>
              <th v-if="$slots.actions" class="text-right">
                <span>{{ actionsLabel }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="rowIndex in skeletonRows" :key="`skeleton-row-${rowIndex}`">
              <td v-for="column in columns" :key="`${column.key}-${rowIndex}`">
                <div class="skeleton h-4 w-full max-w-[180px]"></div>
              </td>
              <td v-if="$slots.actions" class="text-right">
                <div class="skeleton h-8 w-20 ml-auto"></div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="props.mobileCardMode" class="md:hidden space-y-3">
        <article
          v-for="rowIndex in 3"
          :key="`mobile-skeleton-${rowIndex}`"
          class="rounded-xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div class="p-4 space-y-2">
            <div
              v-for="column in columns.slice(0, 4)"
              :key="`${column.key}-${rowIndex}`"
              class="space-y-1"
            >
              <div class="skeleton h-3 w-20"></div>
              <div class="skeleton h-4 w-full"></div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- 表格 / 手機卡片 -->
    <div v-else-if="data.length > 0" class="space-y-3">
      <div :class="[props.mobileCardMode ? 'hidden md:block' : 'block', 'overflow-x-auto']">
        <table :class="tableClasses">
          <thead :class="{ 'sticky top-0 z-10 bg-base-200': stickyHeader }">
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                :style="{ width: column.width }"
                :class="{ 'cursor-pointer hover:bg-base-300': column.sortable }"
                @click="handleSort(column)"
              >
                <div class="flex items-center gap-2">
                  {{ column.label }}
                  <ArrowUpDown v-if="column.sortable" class="h-4 w-4 opacity-50" />
                </div>
              </th>
              <th v-if="$slots.actions" class="text-right">
                <span>{{ actionsLabel }}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in data" :key="index">
              <td v-for="column in columns" :key="column.key">
                <slot :name="`cell-${column.key}`" :value="getCellValue(row, column)" :row="row">
                  {{ getCellValue(row, column) }}
                </slot>
              </td>
              <td v-if="$slots.actions" class="text-right">
                <slot name="actions" :row="row" :index="index"></slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="props.mobileCardMode" class="md:hidden space-y-3">
        <article
          v-for="(row, index) in data"
          :key="`mobile-${index}`"
          class="rounded-xl border border-base-300 bg-base-100 shadow-sm"
        >
          <div class="p-4 space-y-2">
            <div
              v-for="column in columns"
              :key="column.key"
              class="flex items-start justify-between gap-3 text-sm"
            >
              <span class="text-base-content/60 shrink-0">{{ column.label }}</span>
              <span class="text-right break-all">
                <slot :name="`cell-${column.key}`" :value="getCellValue(row, column)" :row="row">
                  {{ getCellValue(row, column) }}
                </slot>
              </span>
            </div>
            <div v-if="$slots.actions" class="pt-2 mt-2 border-t border-base-200">
              <div class="flex justify-end">
                <slot name="actions" :row="row" :index="index"></slot>
              </div>
            </div>
          </div>
        </article>
      </div>
    </div>

    <!-- 空資料狀態 -->
    <div v-else class="text-center py-12 text-base-content/60">
      {{ emptyText }}
    </div>

    <!-- 分頁 -->
    <div v-if="showPagination && data.length > 0" class="mt-4">
      <Pagination
        :current-page="currentPage"
        :page-size="pageSize"
        :total="total"
        :total-pages="totalPages"
        :show-size-selector="showSizeSelector"
        :page-size-options="pageSizeOptions"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
      />
    </div>
  </div>
</template>
