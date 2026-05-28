<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, Input, DataTable, Modal, type Column } from '@/shared/components'
import { message } from '@/shared/utils/message'
import { memberService, type MemberVo, type MemberRequest } from '@/shared/services/memberService'
import { dateFormat, valOrNA } from '@/shared/utils/format'
import { validateEmail, validateTel } from '@/shared/utils/validation'
import { usePagination } from '@/shared/utils/pagination'
import { useAppStore } from '@/stores/app'
import { useAuthStore } from '@/stores/auth'

const { t } = useI18n()
const appStore = useAppStore()
const authStore = useAuthStore()

const pagination = usePagination(10)
const searchCriteria = ref({
  name: '',
  email: '',
  phone: ''
})

const members = ref<MemberVo[]>([])
const loading = ref(false)

const tableColumns = computed<Column<MemberVo>[]>(() => [
  { key: 'id', label: t('member.id'), width: '80px', sortable: true },
  { key: 'username', label: t('member.username'), sortable: true },
  { key: 'name', label: t('member.name'), sortable: true },
  { key: 'email', label: t('member.email') },
  {
    key: 'phone',
    label: t('member.phone'),
    formatter: (val) => {
      const result = valOrNA(val)
      return typeof result === 'string' ? result : String(result)
    }
  },
  {
    key: 'createdAt',
    label: t('member.createdAt'),
    formatter: (val) => dateFormat(val, 'yyyy-MM-dd HH:mm:ss', appStore.timeZone) || 'N/A'
  },
  {
    key: 'updatedAt',
    label: t('member.updatedAt'),
    formatter: (val) => dateFormat(val, 'yyyy-MM-dd HH:mm:ss', appStore.timeZone) || 'N/A'
  }
])

const showModal = ref(false)
const isEdit = ref(false)
const formData = ref<MemberRequest>({
  username: '',
  name: '',
  email: '',
  phone: ''
})
const editingId = ref<number | null>(null)

const formErrors = ref<{
  username?: string
  name?: string
  email?: string
  phone?: string
}>({})

const loadMembers = async () => {
  try {
    loading.value = true
    const response = await memberService.searchMembers({
      name: searchCriteria.value.name || undefined,
      email: searchCriteria.value.email || undefined,
      phone: searchCriteria.value.phone || undefined,
      page: pagination.currentPage.value,
      size: pagination.pageSize.value
    })
    pagination.updateFromResponse(response)
    members.value = response.content
  } catch (error: any) {
    message.error(error.message || t('message.request.error'))
  } finally {
    loading.value = false
  }
}

const searchMembers = () => {
  pagination.resetPage()
  loadMembers()
}

const resetSearch = () => {
  searchCriteria.value = {
    name: '',
    email: '',
    phone: ''
  }
  pagination.resetPage()
  loadMembers()
}

const validateForm = (): boolean => {
  formErrors.value = {}

  if (!formData.value.username?.trim()) {
    formErrors.value.username = t('validation.required.username')
    return false
  }

  if (!formData.value.name?.trim()) {
    formErrors.value.name = t('validation.required.name')
    return false
  }

  if (!formData.value.email?.trim()) {
    formErrors.value.email = t('validation.required.email')
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

const openEditForm = (member: MemberVo) => {
  if (!authStore.canEdit) return
  isEdit.value = true
  editingId.value = member.id ?? null
  formData.value = {
    username: member.username ?? '',
    name: member.name ?? '',
    email: member.email ?? '',
    phone: member.phone || ''
  }
  formErrors.value = {}
  showModal.value = true
}

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

const saveMember = async () => {
  if (!authStore.canEdit) return
  if (!validateForm()) {
    return
  }

  try {
    if (isEdit.value && editingId.value) {
      await memberService.updateMember(editingId.value, formData.value)
      message.success(t('message.update.success'))
    } else {
      await memberService.createMember(formData.value)
      message.success(t('message.add.success'))
    }
    closeForm()
    await loadMembers()
  } catch (error: any) {
    message.error(
      error.message || (isEdit.value ? t('message.update.failed') : t('message.add.failed'))
    )
  }
}

const deleteMember = async (id: number, name: string) => {
  if (!authStore.canDelete) return
  const confirmed = await message.confirm(t('confirm.delete') + `：${name}？`, t('ui.delete'))

  if (!confirmed) {
    return
  }

  try {
    await memberService.deleteMember(id)
    message.success(t('message.delete.success'))
    await loadMembers()
  } catch (error: any) {
    message.error(error.message || t('message.delete.failed'))
  }
}

const handlePageChange = (page: number) => {
  pagination.currentPage.value = page
  loadMembers()
}

const handleSizeChange = (size: number) => {
  pagination.pageSize.value = size
  pagination.resetPage()
  loadMembers()
}

const handleSort = (column: string, direction: 'asc' | 'desc') => {
  message.info(t('api.sort.message', { column, direction }))
}

onMounted(() => {
  loadMembers()
})
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.members')" :subtitle="t('member.subtitle')">
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
            v-model="searchCriteria.name"
            :label="t('member.name')"
            :placeholder="t('member.name.placeholder')"
          />
          <Input
            v-model="searchCriteria.email"
            type="email"
            :label="t('member.email')"
            :placeholder="t('member.email.placeholder')"
          />
          <Input
            v-model="searchCriteria.phone"
            type="tel"
            :label="t('member.phone')"
            :placeholder="t('member.phone.placeholder')"
          />
          <div class="flex items-end gap-2 sm:col-span-2 xl:col-span-1">
            <Button variant="primary" @click="searchMembers" class="flex-1 min-h-10">
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
        :data="members"
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
              @click="deleteMember(row.id ?? 0, row.name ?? '')"
            >
              {{ t('ui.delete') }}
            </Button>
          </div>
        </template>
      </DataTable>
    </Card>

    <Modal
      v-if="authStore.canEdit"
      v-model="showModal"
      :title="(isEdit ? t('ui.update') : t('ui.add')) + ' ' + t('page.members')"
      size="md"
    >
      <div class="space-y-4">
        <Input
          v-model="formData.username"
          :label="t('member.username')"
          :placeholder="t('member.username.placeholder')"
          :status="formErrors.username ? 'fail' : null"
          :status-message="formErrors.username"
          :disabled="isEdit"
        />

        <Input
          v-model="formData.name"
          :label="t('member.name')"
          :placeholder="t('member.name.placeholder')"
          :status="formErrors.name ? 'fail' : null"
          :status-message="formErrors.name"
        />

        <Input
          v-model="formData.email"
          type="email"
          :label="t('member.email')"
          :placeholder="t('member.email.placeholder')"
          :status="formErrors.email ? 'fail' : null"
          :status-message="formErrors.email"
        />

        <Input
          v-model="formData.phone"
          type="tel"
          :label="t('member.phone')"
          :placeholder="t('member.phone.placeholder')"
          :status="formErrors.phone ? 'fail' : null"
          :status-message="formErrors.phone"
        />
      </div>

      <template #footer>
        <Button variant="outline" @click="closeForm">{{ t('ui.cancel') }}</Button>
        <Button variant="primary" @click="saveMember">{{ t('ui.save') }}</Button>
      </template>
    </Modal>
  </div>
</template>
