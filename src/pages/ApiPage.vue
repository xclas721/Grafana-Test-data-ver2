<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, Input, DataTable, type Column } from '@/shared/components'
import { message } from '@/shared/utils/message'
import { httpClient } from '@/shared/services/httpClient'
import { useLoadingStore } from '@/stores/loading'
import { valOrNA, dateFormat } from '@/shared/utils/format'
import { usePagination } from '@/shared/utils/pagination'

const { t } = useI18n()
const loadingStore = useLoadingStore()

// 分頁狀態
const pagination = usePagination(10)

// ===== API 工具 =====
const apiResult = ref<any>(null)
const apiLoading = ref(false)

const runApiDemo = async () => {
  try {
    apiLoading.value = true
    const result = await httpClient.get('/api/health')
    apiResult.value = result
    message.success(t('api.success', { result: valOrNA(JSON.stringify(result)) }))
  } catch (error: any) {
    message.error(t('api.error', { error: valOrNA(error?.message) }))
    apiResult.value = null
  } finally {
    apiLoading.value = false
  }
}

// 分頁查詢示例數據
interface DemoData {
  id: number
  name: string
  status: string
  createdAt: string
}

const demoData = ref<DemoData[]>([])
const demoLoading = ref(false)

const tableColumns = computed<Column<DemoData>[]>(() => [
  { key: 'id', label: t('api.table.id'), width: '80px', sortable: true },
  { key: 'name', label: t('api.table.name'), sortable: true },
  { key: 'status', label: t('api.table.status') },
  {
    key: 'createdAt',
    label: t('api.table.createdAt'),
    formatter: (val) => dateFormat(val) || 'N/A'
  }
])

const runPaginationDemo = async () => {
  try {
    demoLoading.value = true
    loadingStore.startLoading(t('api.pagination.loading'))
    // 模擬 API 請求
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 模擬數據
    const start = (pagination.currentPage.value - 1) * pagination.pageSize.value
    const mockData: DemoData[] = []
    for (let i = 0; i < pagination.pageSize.value; i++) {
      mockData.push({
        id: start + i + 1,
        name: t('api.demo.item', { index: start + i + 1 }),
        status: i % 2 === 0 ? t('api.status.enabled') : t('api.status.disabled'),
        createdAt: new Date().toISOString()
      })
    }

    demoData.value = mockData
    pagination.totalItems.value = 50 // 模擬總數（totalPages 會自動計算）

    message.success(
      t('api.pagination.success', {
        page: pagination.currentPage.value,
        size: pagination.pageSize.value
      })
    )
  } catch (error: any) {
    message.error(error.message)
  } finally {
    demoLoading.value = false
    loadingStore.finishLoading()
  }
}

const handlePageChange = (page: number) => {
  pagination.currentPage.value = page
  runPaginationDemo()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize.value = size
  pagination.resetPage()
  runPaginationDemo()
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  message.info(t('api.sort.message', { column, direction }))
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.api')" :subtitle="t('api.subtitle')" />

    <div class="space-y-6">
      <!-- HTTP 請求 -->
      <Card :title="t('api.http.title')" :subtitle="t('api.http.desc')">
        <div class="space-y-4">
          <div
            class="bg-base-200 p-4 rounded-lg flex justify-between items-center border border-base-300"
          >
            <code class="font-mono text-sm">GET /api/health</code>
            <Button variant="primary" size="sm" :loading="apiLoading" @click="runApiDemo">
              {{ t('api.send') }}
            </Button>
          </div>
          <div v-if="apiResult" class="bg-base-200 p-4 rounded-lg">
            <div class="text-sm text-base-content/70 mb-2">{{ t('api.response.label') }}</div>
            <pre class="text-xs overflow-x-auto">{{ JSON.stringify(apiResult, null, 2) }}</pre>
          </div>
        </div>
      </Card>

      <!-- 分頁查詢 -->
      <Card :title="t('api.pagination.title')" :subtitle="t('api.pagination.desc')">
        <div class="space-y-4">
          <div class="flex gap-4">
            <Input
              type="number"
              v-model.number="pagination.currentPage.value"
              :label="t('api.pagination.page')"
              class="flex-1"
            />
            <Input
              type="number"
              v-model.number="pagination.pageSize.value"
              :label="t('api.pagination.size')"
              class="flex-1"
            />
            <div class="flex items-end">
              <Button variant="primary" :loading="demoLoading" @click="runPaginationDemo">
                {{ t('api.pagination.execute') }}
              </Button>
            </div>
          </div>

          <div v-if="demoData.length > 0" class="overflow-x-auto">
            <DataTable
              :columns="tableColumns"
              :data="demoData"
              :loading="demoLoading"
              :current-page="pagination.currentPage.value"
              :page-size="pagination.pageSize.value"
              :total="pagination.totalItems.value"
              :total-pages="pagination.totalPages.value"
              :actions-label="t('table.actions')"
              :empty-text="t('ui.noData')"
              @page-change="handlePageChange"
              @size-change="handleSizeChange"
              @sort="handleSort"
            />
          </div>
        </div>
      </Card>
    </div>
  </div>
</template>
