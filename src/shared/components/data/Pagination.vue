<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

interface Props {
  currentPage: number
  pageSize: number
  total: number
  totalPages: number
  showSizeSelector?: boolean
  pageSizeOptions?: number[]
}

const props = withDefaults(defineProps<Props>(), {
  showSizeSelector: true,
  pageSizeOptions: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  'update:currentPage': [page: number]
  'update:pageSize': [size: number]
  'page-change': [page: number]
  'size-change': [size: number]
}>()

const { t } = useI18n()

const hasPrevious = computed(() => props.currentPage > 1)
const hasNext = computed(() => props.currentPage < props.totalPages)

const handlePageChange = (page: number) => {
  // 檢查頁碼範圍
  if (page < 1 || page > props.totalPages) {
    return
  }
  // 發出事件（父組件會處理頁碼更新和資料載入）
  emit('page-change', page)
}

const handleSizeChange = (size: number) => {
  emit('update:pageSize', size)
  emit('size-change', size)
  // 切換每頁筆數時，重置到第一頁
  if (props.currentPage !== 1) {
    handlePageChange(1)
  }
}

// 計算顯示的頁碼範圍
const visiblePages = computed(() => {
  const pages: (number | string)[] = []
  const total = props.totalPages
  const current = props.currentPage

  if (total <= 0) {
    return []
  }

  if (total <= 7) {
    // 總頁數少於 7 頁，全部顯示
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // 總頁數多於 7 頁，顯示部分頁碼
    if (current <= 3) {
      // 當前頁在前 3 頁
      for (let i = 1; i <= 5; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 2) {
      // 當前頁在後 3 頁
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) {
        pages.push(i)
      }
    } else {
      // 當前頁在中間
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(total)
    }
  }

  return pages
})

// 計算顯示範圍
const startIndex = computed(() => {
  const total = Number(props.total) || 0
  if (total === 0) return 0
  const current = Number(props.currentPage) || 1
  const size = Number(props.pageSize) || 10
  return (current - 1) * size + 1
})

const endIndex = computed(() => {
  const total = Number(props.total) || 0
  const current = Number(props.currentPage) || 1
  const size = Number(props.pageSize) || 10
  return Math.min(current * size, total)
})
</script>

<template>
  <div class="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
    <!-- 分頁資訊 -->
    <div class="text-xs sm:text-sm text-base-content/60 order-3 md:order-1">
      {{ t('pagination.info', { start: startIndex, end: endIndex, total: props.total }) }}
    </div>

    <!-- 分頁控制 -->
    <div class="flex items-center gap-2 order-1 md:order-2">
      <!-- 每頁筆數選擇器 -->
      <select
        v-if="showSizeSelector"
        :value="props.pageSize"
        @change="handleSizeChange(Number(($event.target as HTMLSelectElement).value))"
        class="select select-bordered select-sm hidden md:inline-flex touch-target"
      >
        <option v-for="size in props.pageSizeOptions" :key="size" :value="size">
          {{ size }} {{ t('pagination.perPage') }}
        </option>
      </select>

      <!-- 上一頁按鈕 -->
      <button
        :disabled="!hasPrevious"
        :class="['btn btn-sm touch-target', hasPrevious ? 'btn-outline' : 'btn-disabled']"
        @click="handlePageChange(props.currentPage - 1)"
      >
        <span class="sm:hidden">‹</span>
        <span class="hidden sm:inline">{{ t('pagination.previous') }}</span>
      </button>

      <!-- 頁碼按鈕（間隔 + 圓角） -->
      <div class="hidden md:flex items-center gap-2">
        <button
          v-for="(page, index) in visiblePages"
          :key="index"
          :class="[
            'btn btn-sm rounded-lg min-w-9 touch-target',
            page === '...'
              ? 'btn-disabled'
              : page === props.currentPage
                ? 'btn-active'
                : 'btn-outline'
          ]"
          :disabled="page === '...'"
          @click="typeof page === 'number' && handlePageChange(page)"
        >
          {{ page }}
        </button>
      </div>

      <div class="md:hidden text-xs px-2 py-1 rounded-md bg-base-200 text-base-content/70">
        {{ props.currentPage }} / {{ props.totalPages || 1 }}
      </div>

      <!-- 下一頁按鈕 -->
      <button
        :disabled="!hasNext"
        :class="['btn btn-sm touch-target', hasNext ? 'btn-outline' : 'btn-disabled']"
        @click="handlePageChange(props.currentPage + 1)"
      >
        <span class="sm:hidden">›</span>
        <span class="hidden sm:inline">{{ t('pagination.next') }}</span>
      </button>
    </div>
  </div>
</template>
