<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Button, Card, PageHeader, TooltipWrapper, ProgressInline } from '@/shared/components'
import { message } from '@/shared/utils/message'
import { base64ToFile } from '@/shared/utils/file'

const { t } = useI18n()
const activeTab = ref<'base64ToFile' | 'fileToBase64'>('base64ToFile')

// ===== Base64 轉 File =====
const base64Input = ref('')
const base64File = ref<File | null>(null)

/**
 * 從 MIME 類型推斷副檔名
 */
const getExtensionFromMime = (mime: string | undefined): string => {
  if (!mime) return 'bin'
  const mimeMap: Record<string, string> = {
    'image/png': 'png',
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'text/plain': 'txt',
    'text/html': 'html',
    'text/css': 'css',
    'text/javascript': 'js',
    'application/json': 'json',
    'application/pdf': 'pdf',
    'application/zip': 'zip',
    'application/x-zip-compressed': 'zip',
    'application/x-rar-compressed': 'rar',
    'application/x-7z-compressed': '7z',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/x-msdownload': 'exe',
    'application/x-executable': 'exe',
    'application/x-sharedlib': 'so',
    'application/x-dll': 'dll'
  }
  return mimeMap[mime] || 'bin'
}

/**
 * 從 Base64 data URL 提取檔案名稱
 * 支援完整 data URL 或純 Base64 字串
 */
const getFileNameFromBase64 = (input: string): string => {
  let mime = 'application/octet-stream'

  // 如果是完整的 data URL
  if (input.startsWith('data:')) {
    const arr = input.split(',')
    if (arr.length >= 2 && arr[0]) {
      const mimeRegex = /data:(.*?);base64/
      const mimeMatch = mimeRegex.exec(arr[0])
      if (mimeMatch && mimeMatch[1]) {
        mime = mimeMatch[1]
      }
    }
  } else {
    // 純 Base64 字串，嘗試從內容推斷（簡單檢測）
    // 這裡只做基本檢測，詳細檢測在 base64ToFile 中進行
    mime = 'application/octet-stream'
  }

  // 從 MIME 類型推斷副檔名
  const ext = getExtensionFromMime(mime)
  const timestamp = Date.now()
  return `file_${timestamp}.${ext}`
}

const handleBase64ToFile = () => {
  try {
    if (!base64Input.value || !base64Input.value.trim()) {
      message.warn(t('file.base64tofile.empty'))
      return
    }

    // 計算實際 Base64 資料長度（排除前綴）
    const trimmed = base64Input.value.trim()
    const base64Data = trimmed.includes(',') ? trimmed.split(',')[1] : trimmed
    if (!base64Data) {
      message.error(t('file.base64tofile.invalid'))
      return
    }

    // 檔案大小檢查（Base64 會增加約 33% 大小）
    const estimatedSize = (base64Data.length * 3) / 4
    const MAX_SIZE = 5 * 1024 * 1024 // 5MB
    if (estimatedSize > MAX_SIZE) {
      message.warn(t('file.base64tofile.sizeLimit'))
      return
    }

    // 自動從 MIME 類型推斷檔案名稱
    const fileName = getFileNameFromBase64(trimmed)
    if (!fileName) {
      throw new Error('無法從 Base64 字串推斷檔案名稱')
    }

    // 轉換（base64ToFile 會自動處理有無前綴的情況）
    base64File.value = base64ToFile(trimmed, fileName)
    message.success(t('file.base64tofile.success', { name: base64File.value.name }))
  } catch (error: any) {
    // 提供更具體的錯誤訊息
    const errorMessage = error.message || t('file.base64tofile.error')
    message.error(errorMessage)
  }
}

// ===== 下載檔案 =====
const downloadFile = () => {
  if (!base64File.value) {
    return
  }
  try {
    const url = URL.createObjectURL(base64File.value)
    const a = document.createElement('a')
    a.href = url
    a.download = base64File.value.name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    message.success(t('file.download.success', { name: base64File.value.name }))
  } catch {
    message.error(t('file.download.failed'))
  }
}

// ===== File 轉 Base64 =====
const fileInput = ref<File | null>(null)
const fileBase64 = ref('') // 保存完整的 data URL（包含 MIME 前綴）
const fileBase64Preview = ref('') // 僅用於顯示的 Base64 部分
const fileReadProgress = ref(0)
const isConvertingFile = ref(false)
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0] || null
  if (file) {
    if (file.size > MAX_FILE_SIZE) {
      message.warn(t('file.filetobase64.sizeLimit', { size: (file.size / 1024 / 1024).toFixed(2) }))
      target.value = '' // 清除選擇
      fileInput.value = null
      return
    }
    fileInput.value = file
  } else {
    fileInput.value = null
  }
}

const handleFileToBase64 = async () => {
  if (!fileInput.value) {
    message.warn(t('file.filetobase64.empty'))
    return
  }
  // 再次檢查檔案大小
  if (fileInput.value.size > MAX_FILE_SIZE) {
    message.warn(
      t('file.filetobase64.sizeLimit', { size: (fileInput.value.size / 1024 / 1024).toFixed(2) })
    )
    return
  }
  try {
    isConvertingFile.value = true
    fileReadProgress.value = 0
    // 獲取完整的 data URL（包含 MIME 前綴）
    const fullDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(fileInput.value!)
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          fileReadProgress.value = Math.round((event.loaded / event.total) * 100)
        }
      }
      reader.onload = () => {
        if (reader.result) {
          fileReadProgress.value = 100
          resolve(reader.result.toString())
        } else {
          reject(new Error('讀取檔案失敗'))
        }
      }
      reader.onerror = reject
    })

    // 保存完整的 data URL（用於複製和轉換）
    fileBase64.value = fullDataUrl
    // 提取純 Base64 部分（用於顯示）
    fileBase64Preview.value = fullDataUrl.split(',')[1] || ''
    message.success(t('file.filetobase64.success'))
  } catch (error: any) {
    message.error(error.message)
  } finally {
    isConvertingFile.value = false
  }
}

// ===== 清除結果 =====
const clearBase64ToFile = () => {
  base64Input.value = ''
  base64File.value = null
}

const clearFileToBase64 = () => {
  fileInput.value = null
  fileBase64.value = ''
  fileBase64Preview.value = ''
  fileReadProgress.value = 0
}

// ===== 複製 Base64 =====
const copyBase64 = async () => {
  if (!fileBase64.value) {
    return
  }
  try {
    await navigator.clipboard.writeText(fileBase64.value)
    message.success(t('file.filetobase64.copied'))
  } catch {
    // 降級方案：使用傳統方法
    const textArea = document.createElement('textarea')
    textArea.value = fileBase64.value
    textArea.style.position = 'fixed'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.select()
    try {
      document.execCommand('copy')
      message.success(t('file.filetobase64.copied'))
    } catch {
      message.error(t('file.filetobase64.copyFailed'))
    }
    document.body.removeChild(textArea)
  }
}
</script>

<template>
  <div class="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10 max-w-7xl">
    <PageHeader :title="t('page.files')" :subtitle="t('file.subtitle')" />

    <div role="tablist" class="tabs tabs-box mb-4">
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'base64ToFile' }"
        @click="activeTab = 'base64ToFile'"
      >
        {{ t('file.base64tofile.title') }}
      </a>
      <a
        role="tab"
        class="tab"
        :class="{ 'tab-active': activeTab === 'fileToBase64' }"
        @click="activeTab = 'fileToBase64'"
      >
        {{ t('file.filetobase64.title') }}
      </a>
    </div>

    <!-- Base64 轉 File -->
    <Card
      v-if="activeTab === 'base64ToFile'"
      :title="t('file.base64tofile.title')"
      :subtitle="t('file.base64tofile.desc')"
    >
      <div class="flex flex-col gap-4">
        <div>
          <label class="label">
            <span class="label-text">{{ t('file.base64tofile.label') }}</span>
          </label>
          <textarea
            v-model="base64Input"
            :placeholder="t('file.base64tofile.placeholder')"
            class="textarea textarea-bordered w-full h-24 font-mono text-sm"
          ></textarea>
          <div class="text-xs text-base-content/60">
            {{ t('file.base64tofile.sizeHint') }}
          </div>
        </div>
        <div class="flex gap-2">
          <TooltipWrapper :tip="t('file.base64tofile.convert')" class="flex-1">
            <Button variant="primary" @click="handleBase64ToFile" class="w-full">
              {{ t('file.base64tofile.convert') }}
            </Button>
          </TooltipWrapper>
          <Button variant="outline" @click="clearBase64ToFile">
            {{ t('ui.reset') }}
          </Button>
        </div>
        <div v-if="base64File" class="bg-base-200 p-4 rounded-lg space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold">{{ t('file.result') }}</div>
            <TooltipWrapper :tip="t('file.download')">
              <Button variant="primary" size="sm" @click="downloadFile">
                {{ t('file.download') }}
              </Button>
            </TooltipWrapper>
          </div>
          <div class="text-sm">
            <span class="text-base-content/70">{{ t('file.name') }}：</span>
            <span class="font-mono">{{ base64File.name }}</span>
          </div>
          <div class="text-sm">
            <span class="text-base-content/70">{{ t('file.size') }}：</span>
            <span class="font-mono">{{ base64File.size.toLocaleString() }} bytes</span>
          </div>
          <div class="text-sm">
            <span class="text-base-content/70">{{ t('file.type') }}：</span>
            <span class="font-mono">{{ base64File.type || 'N/A' }}</span>
          </div>
        </div>
      </div>
    </Card>

    <!-- File 轉 Base64 -->
    <Card v-else :title="t('file.filetobase64.title')" :subtitle="t('file.filetobase64.desc')">
      <div class="flex flex-col gap-4">
        <div>
          <label class="label">
            <span class="label-text">{{ t('file.filetobase64.label') }}</span>
          </label>
          <input
            type="file"
            @change="handleFileSelect"
            class="file-input file-input-bordered w-full"
          />
          <div class="text-xs text-base-content/60 mt-1">
            {{ t('file.filetobase64.sizeHint') }}
          </div>
        </div>
        <div class="flex gap-2">
          <TooltipWrapper :tip="t('file.filetobase64.convert')" class="flex-1">
            <Button
              variant="primary"
              :loading="isConvertingFile"
              @click="handleFileToBase64"
              class="w-full"
            >
              {{ t('file.filetobase64.convert') }}
            </Button>
          </TooltipWrapper>
          <Button variant="outline" @click="clearFileToBase64">
            {{ t('ui.reset') }}
          </Button>
        </div>
        <ProgressInline
          v-if="isConvertingFile"
          :value="fileReadProgress"
          :max="100"
          tone="primary"
        />
        <div v-if="fileBase64" class="bg-base-200 p-4 rounded-lg space-y-2">
          <div class="flex items-center justify-between">
            <div class="text-sm font-semibold">{{ t('file.result') }}</div>
            <TooltipWrapper :tip="t('file.filetobase64.copy')">
              <Button variant="outline" size="sm" @click="copyBase64">
                {{ t('file.filetobase64.copy') }}
              </Button>
            </TooltipWrapper>
          </div>
          <div class="text-sm text-base-content/70 mb-1">
            {{ t('file.filetobase64.preview') }}
          </div>
          <div class="font-mono text-xs break-all bg-base-300 p-2 rounded max-h-32 overflow-y-auto">
            {{ fileBase64Preview.substring(0, 200)
            }}{{ fileBase64Preview.length > 200 ? '...' : '' }}
          </div>
          <div class="text-xs text-base-content/60">
            {{
              t('file.filetobase64.length', { length: fileBase64Preview.length.toLocaleString() })
            }}
          </div>
        </div>
      </div>
    </Card>
  </div>
</template>
