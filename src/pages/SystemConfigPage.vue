<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, Input, DataTable, Modal, type Column } from '@/shared/components'
import { message } from '@/shared/utils/message'
import {
  systemConfigService,
  type SystemConfigVo,
  type SystemConfigRequest,
  type SystemConfigUpdateRequest
} from '@/shared/services/systemConfigService'
import { usePagination } from '@/shared/utils/pagination'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const authStore = useAuthStore()
const pagination = usePagination(10)
const searchCriteria = ref({ key: '', type: '' })
const list = ref<SystemConfigVo[]>([])
const loading = ref(false)

const tableColumns = computed<Column<SystemConfigVo>[]>(() => [
  { key: 'id', label: 'ID', width: '80px', sortable: true },
  { key: 'key', label: t('systemConfig.key'), sortable: true },
  {
    key: 'value',
    label: t('systemConfig.value'),
    formatter: (val) => (val != null ? String(val) : '')
  },
  {
    key: 'type',
    label: t('systemConfig.type'),
    formatter: (val) => (val != null ? String(val) : '')
  },
  {
    key: 'description',
    label: t('systemConfig.description'),
    formatter: (val) => (val != null ? String(val) : '')
  }
])

const showModal = ref(false)
const isEdit = ref(false)
const formData = ref<SystemConfigRequest & { id?: number }>({
  key: '',
  value: '',
  type: 'string',
  description: ''
})
const editingId = ref<number | null>(null)
const formErrors = ref<Record<string, string>>({})

const loadList = async () => {
  try {
    loading.value = true
    const response = await systemConfigService.search({
      key: searchCriteria.value.key || undefined,
      type: searchCriteria.value.type || undefined,
      page: pagination.currentPage.value,
      size: pagination.pageSize.value
    })
    pagination.updateFromResponse(response)
    list.value = response.content ?? []
  } catch (error: any) {
    message.error(error.message || t('message.request.error'))
  } finally {
    loading.value = false
  }
}

const search = () => {
  pagination.resetPage()
  loadList()
}

const resetSearch = () => {
  searchCriteria.value = { key: '', type: '' }
  pagination.resetPage()
  loadList()
}

const validateForm = (): boolean => {
  formErrors.value = {}
  if (!isEdit.value && !formData.value.key?.trim()) {
    formErrors.value.key = t('validation.required')
    return false
  }
  if (!formData.value.value?.trim()) {
    formErrors.value.value = t('validation.required')
    return false
  }
  if (!formData.value.type?.trim()) {
    formErrors.value.type = t('validation.required')
    return false
  }
  return true
}

const openAddForm = () => {
  if (!authStore.canEdit) return
  isEdit.value = false
  editingId.value = null
  formData.value = { key: '', value: '', type: 'string', description: '' }
  formErrors.value = {}
  showModal.value = true
}

const openEditForm = (row: SystemConfigVo) => {
  if (!authStore.canEdit) return
  isEdit.value = true
  editingId.value = row.id ?? null
  formData.value = {
    id: row.id,
    key: row.key ?? '',
    value: row.value ?? '',
    type: row.type ?? 'string',
    description: row.description ?? ''
  }
  formErrors.value = {}
  showModal.value = true
}

const closeForm = () => {
  showModal.value = false
  formData.value = { key: '', value: '', type: 'string', description: '' }
  formErrors.value = {}
}

const save = async () => {
  if (!authStore.canEdit) return
  if (!validateForm()) return
  try {
    if (isEdit.value && editingId.value != null) {
      const payload: SystemConfigUpdateRequest = {
        value: formData.value.value,
        type: formData.value.type,
        description: formData.value.description
      }
      await systemConfigService.update(editingId.value, payload)
      message.success(t('message.update.success'))
    } else {
      await systemConfigService.create({
        key: formData.value.key,
        value: formData.value.value,
        type: formData.value.type,
        description: formData.value.description
      })
      message.success(t('message.add.success'))
    }
    closeForm()
    await loadList()
  } catch (error: any) {
    message.error(
      error.message || (isEdit.value ? t('message.update.failed') : t('message.add.failed'))
    )
  }
}

const handlePageChange = (page: number) => {
  pagination.currentPage.value = page
  loadList()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize.value = size
  pagination.resetPage()
  loadList()
}

const handleSort = () => {
  loadList()
}

onMounted(() => {
  loadList()
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.systemConfigs')" :subtitle="t('systemConfig.subtitle')">
      <template #actions>
        <Button
          v-if="authStore.canEdit"
          variant="primary"
          @click="openAddForm"
          class="w-full sm:w-auto"
        >
          {{ t('ui.add') }}
        </Button>
      </template>
    </PageHeader>

    <div class="mb-6 space-y-4">
      <Card>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Input
            v-model="searchCriteria.key"
            :label="t('systemConfig.key')"
            :placeholder="t('systemConfig.key.placeholder')"
          />
          <Input
            v-model="searchCriteria.type"
            :label="t('systemConfig.type')"
            :placeholder="t('systemConfig.type.placeholder')"
          />
          <div class="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
            <Button variant="primary" @click="search" class="flex-1 min-h-10">
              {{ t('ui.search') }}
            </Button>
            <Button variant="outline" @click="resetSearch" class="flex-1 min-h-10">
              {{ t('ui.reset') }}
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <Card>
      <DataTable
        :columns="tableColumns"
        :data="list"
        :loading="loading"
        :current-page="pagination.currentPage.value"
        :page-size="pagination.pageSize.value"
        :total="pagination.totalItems.value"
        :total-pages="pagination.totalPages.value"
        :actions-label="t('table.actions')"
        :empty-text="t('ui.noData')"
        :mobile-card-mode="true"
        @page-change="handlePageChange"
        @size-change="handleSizeChange"
        @sort="handleSort"
      >
        <template #actions="{ row }">
          <div class="flex justify-end gap-2 flex-wrap">
            <Button v-if="authStore.canEdit" variant="outline" size="sm" @click="openEditForm(row)">
              {{ t('ui.edit') }}
            </Button>
          </div>
        </template>
      </DataTable>
    </Card>

    <Modal
      v-if="authStore.canEdit"
      v-model="showModal"
      :title="(isEdit ? t('ui.update') : t('ui.add')) + ' ' + t('page.systemConfigs')"
      size="md"
    >
      <div class="space-y-4">
        <Input
          v-model="formData.key"
          :label="t('systemConfig.key')"
          :placeholder="t('systemConfig.key.placeholder')"
          :status="formErrors.key ? 'fail' : null"
          :status-message="formErrors.key"
          :disabled="isEdit"
        />
        <Input
          v-model="formData.value"
          :label="t('systemConfig.value')"
          :placeholder="t('systemConfig.value.placeholder')"
          :status="formErrors.value ? 'fail' : null"
          :status-message="formErrors.value"
        />
        <Input
          v-model="formData.type"
          :label="t('systemConfig.type')"
          :placeholder="t('systemConfig.type.placeholder')"
          :status="formErrors.type ? 'fail' : null"
          :status-message="formErrors.type"
        />
        <Input
          v-model="formData.description"
          :label="t('systemConfig.description')"
          :placeholder="t('systemConfig.description.placeholder')"
        />
      </div>
      <template #footer>
        <Button variant="outline" @click="closeForm">{{ t('ui.cancel') }}</Button>
        <Button variant="primary" @click="save">{{ t('ui.save') }}</Button>
      </template>
    </Modal>
  </div>
</template>
