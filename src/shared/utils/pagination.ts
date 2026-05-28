// 分頁工具 - 簡化版
import { ref, computed } from 'vue'
import { appConfig } from '@/shared/config/appConfig'

/**
 * 分頁回應格式（後端返回）
 */
export interface PageResponse<T> {
  content: T[]
  currentPage: number // 後端從 0 開始
  pageSize: number
  totalItems: number
  totalPages: number
  hasPrevious: boolean
  hasNext: boolean
  first: boolean
  last: boolean
}

/**
 * 分頁狀態管理 - 最簡單的實現
 */
export function usePagination(initialPageSize?: number) {
  const currentPage = ref(1) // 前端從 1 開始
  const pageSize = ref(initialPageSize ?? appConfig.PAGE_SIZE ?? 10)
  const totalItems = ref(0)
  const totalPages = computed(() => Math.ceil(totalItems.value / pageSize.value))

  /**
   * 從後端回應更新分頁狀態
   */
  const updateFromResponse = (response: PageResponse<any>) => {
    totalItems.value = response.totalItems
    currentPage.value = response.currentPage + 1 // 後端從 0 開始，前端從 1 開始
    pageSize.value = response.pageSize
  }

  /**
   * 重置到第一頁
   */
  const resetPage = () => {
    currentPage.value = 1
  }

  /**
   * 前往指定頁
   */
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  return {
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    updateFromResponse,
    resetPage,
    goToPage
  }
}
