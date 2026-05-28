<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, Input, DataTable, Modal, type Column } from '@/shared/components'
import { message } from '@/shared/utils/message'
import { userService, type UserVo, type UserRequest } from '@/shared/services/userService'
import { dateFormat, valOrNA } from '@/shared/utils/format'
import { validateEmail, validateTel } from '@/shared/utils/validation'
import { usePagination } from '@/shared/utils/pagination'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

// 分頁狀態
const pagination = usePagination(10)

// 查詢條件
const searchCriteria = ref({
  name: '',
  email: '',
  phone: ''
})

// 資料列表
const users = ref<UserVo[]>([])
const loading = ref(false)

// DataTable 欄位定義（使用 computed 以響應時區變化）
const tableColumns = computed<Column<UserVo>[]>(() => [
  { key: 'id', label: t('user.id'), width: '80px', sortable: true },
  { key: 'username', label: t('user.username'), sortable: true },
  { key: 'name', label: t('user.name'), sortable: true },
  { key: 'email', label: t('user.email') },
  {
    key: 'phone',
    label: t('user.phone'),
    formatter: (val) => {
      const result = valOrNA(val)
      return typeof result === 'string' ? result : String(result)
    }
  },
  {
    key: 'createdAt',
    label: t('user.createdAt'),
    formatter: (val) => dateFormat(val, 'yyyy-MM-dd HH:mm:ss', appStore.timeZone) || 'N/A'
  },
  {
    key: 'updatedAt',
    label: t('user.updatedAt'),
    formatter: (val) => dateFormat(val, 'yyyy-MM-dd HH:mm:ss', appStore.timeZone) || 'N/A'
  }
])

// 表單狀態
const showModal = ref(false)
const isEdit = ref(false)
const formData = ref<UserRequest>({
  username: '',
  name: '',
  email: '',
  phone: ''
})
const editingId = ref<number | null>(null)

// 表單驗證
const formErrors = ref<{
  username?: string
  name?: string
  email?: string
  phone?: string
}>({})

/**
 * 載入使用者列表（分頁查詢）
 */
const loadUsers = async () => {
  try {
    loading.value = true
    const response = await userService.searchUsers({
      name: searchCriteria.value.name || undefined,
      email: searchCriteria.value.email || undefined,
      phone: searchCriteria.value.phone || undefined,
      page: pagination.currentPage.value,
      size: pagination.pageSize.value
    })
    pagination.updateFromResponse(response)
    users.value = response.content
  } catch (error: any) {
    message.error(error.message || t('message.request.error'))
  } finally {
    loading.value = false
  }
}

/**
 * 搜尋使用者（重置到第一頁）
 */
const searchUsers = () => {
  pagination.resetPage()
  loadUsers()
}

/**
 * 重置查詢條件
 */
const resetSearch = () => {
  searchCriteria.value = {
    name: '',
    email: '',
    phone: ''
  }
  pagination.resetPage()
  loadUsers()
}

/**
 * 驗證表單
 */
const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.username?.trim()) {
    formErrors.value.username = t('validation.required')
    return false
  }

  if (!formData.value.name?.trim()) {
    formErrors.value.name = t('validation.required')
    return false
  }

  if (!formData.value.email?.trim()) {
    formErrors.value.email = t('validation.required')
    return false
  }

  if (formData.value.email && !validateEmail(formData.value.email).result) {
    formErrors.value.email = t('validation.email')
    return false
  }

  if (formData.value.phone && !validateTel(formData.value.phone).result) {
    formErrors.value.phone = t('validation.tel')
    return false
  }

  return true
}

/**
 * 開啟新增表單
 */
const openAddForm = () => {
  if (!authStore.canEdit) return
  isEdit.value = false
  editingId.value = null
  formData.value = {
    username: '',
    name: '',
    email: '',
    phone: ''
  }
  formErrors.value = {}
  showModal.value = true
}

/**
 * 開啟編輯表單
 */
const openEditForm = (user: UserVo) => {
  if (!authStore.canEdit) return
  isEdit.value = true
  editingId.value = user.id ?? null
  formData.value = {
    username: user.username ?? '',
    name: user.name ?? '',
    email: user.email ?? '',
    phone: user.phone || ''
  }
  formErrors.value = {}
  showModal.value = true
}

/**
 * 關閉表單
 */
const closeForm = () => {
  showModal.value = false
  formData.value = {
    username: '',
    name: '',
    email: '',
    phone: ''
  }
  formErrors.value = {}
}

/**
 * 儲存使用者（新增或更新）
 */
const saveUser = async () => {
  if (!authStore.canEdit) return
  if (!validateForm()) {
    return
  }

  try {
    if (isEdit.value && editingId.value) {
      await userService.updateUser(editingId.value, formData.value)
      message.success(t('message.update.success'))
    } else {
      await userService.createUser(formData.value)
      message.success(t('message.add.success'))
    }
    closeForm()
    await loadUsers()
  } catch (error: any) {
    message.error(
      error.message || (isEdit.value ? t('message.update.failed') : t('message.add.failed'))
    )
  }
}

/**
 * 刪除使用者
 */
const deleteUser = async (id: number, name: string) => {
  if (!authStore.canDelete) return
  const confirmed = await message.confirm(t('confirm.delete') + `：${name}？`, t('ui.delete'))

  if (!confirmed) {
    return
  }

  try {
    await userService.deleteUser(id)
    message.success(t('message.delete.success'))
    await loadUsers()
  } catch (error: any) {
    message.error(error.message || t('message.delete.failed'))
  }
}

// 處理頁碼變更
const handlePageChange = (page: number) => {
  pagination.currentPage.value = page
  loadUsers()
}

// 處理每頁筆數變更
const handleSizeChange = (size: number) => {
  pagination.pageSize.value = size
  pagination.resetPage()
  loadUsers()
}

// 處理排序
const handleSort = (column: string, direction: 'asc' | 'desc') => {
  // 這裡可以實現排序邏輯
  message.info(t('api.sort.message', { column, direction }))
}

// 匯出 CSV
const exporting = ref(false)
const exportCsv = async () => {
  try {
    exporting.value = true
    await userService.exportUsersCsv()
    message.success(t('message.export.success'))
  } catch (error: any) {
    message.error(error.message || t('message.export.failed'))
  } finally {
    exporting.value = false
  }
}

// 初始化
onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.users')" :subtitle="t('user.subtitle')">
      <template #actions>
        <Button variant="outline" @click="exportCsv" class="w-full sm:w-auto" :disabled="exporting">
          {{ exporting ? t('ui.exporting') : t('ui.exportCsv') }}
        </Button>
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

    <!-- 操作列 -->
    <div class="mb-6 space-y-4">
      <!-- 查詢條件 -->
      <Card>
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <Input
            v-model="searchCriteria.name"
            :label="t('user.name')"
            :placeholder="t('user.name.placeholder')"
          />
          <Input
            v-model="searchCriteria.email"
            type="email"
            :label="t('user.email')"
            :placeholder="t('user.email.placeholder')"
          />
          <Input
            v-model="searchCriteria.phone"
            type="tel"
            :label="t('user.phone')"
            :placeholder="t('user.phone.placeholder')"
          />
          <div class="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
            <Button variant="primary" @click="searchUsers" class="flex-1 min-h-10">
              {{ t('ui.search') }}
            </Button>
            <Button variant="outline" @click="resetSearch" class="flex-1 min-h-10">
              {{ t('ui.reset') }}
            </Button>
          </div>
        </div>
      </Card>
    </div>

    <!-- 使用者列表 -->
    <Card>
      <DataTable
        :columns="tableColumns"
        :data="users"
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
            <Button
              v-if="authStore.canDelete"
              variant="danger"
              size="sm"
              @click="deleteUser(row.id ?? 0, row.name ?? '')"
            >
              {{ t('ui.delete') }}
            </Button>
          </div>
        </template>
      </DataTable>
    </Card>

    <!-- 新增/編輯表單 Modal -->
    <Modal
      v-if="authStore.canEdit"
      v-model="showModal"
      :title="(isEdit ? t('ui.update') : t('ui.add')) + ' ' + t('page.users')"
      size="md"
    >
      <div class="space-y-4">
        <!-- 帳號 -->
        <Input
          v-model="formData.username"
          :label="t('user.username')"
          :placeholder="t('user.username.placeholder')"
          :status="formErrors.username ? 'fail' : null"
          :status-message="formErrors.username"
          :disabled="isEdit"
        />

        <!-- 姓名 -->
        <Input
          v-model="formData.name"
          :label="t('user.name')"
          :placeholder="t('user.name.placeholder')"
          :status="formErrors.name ? 'fail' : null"
          :status-message="formErrors.name"
        />

        <!-- Email -->
        <Input
          v-model="formData.email"
          type="email"
          :label="t('user.email')"
          :placeholder="t('user.email.placeholder')"
          :status="formErrors.email ? 'fail' : null"
          :status-message="formErrors.email"
        />

        <!-- 電話 -->
        <Input
          v-model="formData.phone"
          type="tel"
          :label="t('user.phone')"
          :placeholder="t('user.phone.placeholder')"
          :status="formErrors.phone ? 'fail' : null"
          :status-message="formErrors.phone"
        />
      </div>

      <template #footer>
        <Button variant="outline" @click="closeForm">{{ t('ui.cancel') }}</Button>
        <Button variant="primary" @click="saveUser">{{ t('ui.save') }}</Button>
      </template>
    </Modal>
  </div>
</template>
