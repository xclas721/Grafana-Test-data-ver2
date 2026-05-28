// 檔案處理工具

/**
 * 驗證 Base64 字串格式
 * @param base64 Base64 字串
 * @returns 是否為有效的 Base64 字串
 */
const isValidBase64 = (base64: string): boolean => {
  if (!base64 || base64.trim().length === 0) {
    return false
  }
  // Base64 字串只應包含 A-Z, a-z, 0-9, +, /, = 字符
  // 並且長度應為 4 的倍數（padding 後）
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
  return base64Regex.test(base64)
}

/**
 * 標準化 Base64 輸入（自動處理有無前綴的情況）
 * @param input 用戶輸入的 Base64 字串
 * @returns 標準化的 data URL 格式
 */
const normalizeBase64Input = (input: string): { dataUrl: string; mime: string; base64: string } => {
  const trimmed = input.trim()

  // 若為完整 data URL
  if (trimmed.startsWith('data:')) {
    const arr = trimmed.split(',')
    const base64Part = arr[1]
    const headerPart = arr[0]
    if (arr.length < 2 || !base64Part || !headerPart) {
      throw new Error('Invalid data URL format')
    }

    // 提取 MIME 類型
    const mimeRegex = /data:(.*?);base64/
    const mimeMatch = mimeRegex.exec(headerPart)
    let mime = 'application/octet-stream'
    if (mimeMatch && mimeMatch[1]) {
      mime = mimeMatch[1]
    }

    // 驗證 Base64 部分
    if (!isValidBase64(base64Part)) {
      throw new Error('Invalid Base64 data')
    }

    return {
      dataUrl: trimmed,
      mime,
      base64: base64Part
    }
  }

  // 如果只是純 Base64 字串，嘗試推斷 MIME 類型
  if (!isValidBase64(trimmed)) {
    throw new Error('Invalid Base64 format')
  }

  // 根據常見的檔案特徵推斷 MIME 類型
  let mime = 'application/octet-stream'
  const firstBytes = atob(trimmed.substring(0, Math.min(8, trimmed.length)))
  const bytes = new Uint8Array(firstBytes.length)
  for (let i = 0; i < firstBytes.length; i++) {
    bytes[i] = firstBytes.charCodeAt(i)
  }

  // 簡單的檔案類型檢測（魔數檢測）
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    mime = 'image/png'
  } else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    mime = 'image/jpeg'
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    mime = 'image/gif'
  } else if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    mime = 'application/pdf'
  }

  return {
    dataUrl: `data:${mime};base64,${trimmed}`,
    mime,
    base64: trimmed
  }
}

/**
 * Base64 轉 File 物件（使用 Blob 轉換以確保瀏覽器相容性）
 * @param urlData Base64 字串（可包含 data:image/png;base64, 前綴，或純 Base64 字串）
 * @param fileName 檔案名稱
 * @returns File 物件
 */
export const base64ToFile = (urlData: string, fileName: string): File => {
  if (!urlData || urlData.trim().length === 0) {
    throw new Error('Base64 input is empty')
  }

  try {
    // 標準化輸入（自動處理有無前綴的情況）
    const normalized = normalizeBase64Input(urlData)

    // 解碼 base64
    const bytes = atob(normalized.base64)
    const ia = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) {
      ia[i] = bytes.charCodeAt(i)
    }

    // 使用 Blob 轉 File 以確保瀏覽器相容性（iOS 11.4 以下不支援直接 new File）
    const blob = new Blob([ia], { type: normalized.mime })
    return new File([blob], fileName, { type: normalized.mime, lastModified: Date.now() })
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    throw new Error(`Base64 conversion failed: ${msg}`, { cause: error })
  }
}

// 檔案大小限制（5MB）
const MAX_FILE_SIZE = 5 * 1024 * 1024

/**
 * File 轉 Base64（返回純 base64 字串，不含前綴）
 * @param file 檔案物件
 * @returns Promise<string> Base64 字串（不含 data:... 前綴）
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('File is required'))
      return
    }

    // 簡單的檔案大小檢查
    if (file.size > MAX_FILE_SIZE) {
      reject(new Error(`檔案大小超過限制（最大 5MB）`))
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => {
      if (reader.result) {
        // 返回純 base64 字串，不含前綴
        const result = reader.result.toString()
        const base64 = result.split(',')[1]
        resolve(base64 || '')
      } else {
        resolve('')
      }
    }
    reader.onerror = (err) => reject(err)
  })
}

/**
 * 多檔案上傳處理（預留對接後端）
 *
 * 本函數設計為接收外部傳入的 uploadApi，呼叫後端上傳端點（例如 /upload-multi），
 * 並預期回應格式：{ success, code: '0000', message?, data: Array<{ msgType, fileId }> }。
 * 目前後端尚未提供此 API（後端僅有 StorageService 抽象，未對外暴露 REST 上傳端點），
 * 故專案內尚無頁面呼叫此函數。待後端實作對應端點後，可由呼叫端傳入 apiClient 或
 * 專用 upload 方法即可對接。Base64 與 File 互轉（base64ToFile、fileToBase64）已於
 * 工具／檔案頁使用。
 *
 * @param msgTypes 訊息類型陣列
 * @param fields 表單檔案欄位名稱陣列
 * @param fieldIds 表單檔案 ID 欄位名稱陣列
 * @param form 表單資料
 * @param formDetails 查詢得到的詳細資料（用於比較檔案是否變更）
 * @param uploadApi 上傳 API 函數 (path: string, formData: FormData, headers: any) => Promise<any>
 * @returns 更新後的表單資料
 */
export const uploadFile = async (
  msgTypes: string[],
  fields: string[],
  fieldIds: string[],
  form: Record<string, any>,
  formDetails: Record<string, any>,
  uploadApi: (path: string, formData: FormData, headers: any) => Promise<any>
): Promise<Record<string, any>> => {
  const files: File[] = []
  const fileMappings: {
    field: string
    fieldId: string
    msgType: string
    originalId: string
    change: boolean
  }[] = []

  // 過濾掉沒有改變的檔案，並保留檔案與其對應的欄位和欄位 ID
  for (let i = 0; i < fields.length; i++) {
    const val = fields[i]
    const fieldId = fieldIds[i]
    const msgType = msgTypes[i]

    if (!val || !fieldId || !msgType) {
      continue
    }

    const originalId = formDetails[fieldId]
    if (!form[val]) {
      continue
    }

    const fileBase64 = await fileToBase64(form[val])
    const hasChanged = fileBase64 !== formDetails[val]

    if (hasChanged) {
      // 檔案有更新，保存檔案並記錄
      files.push(form[val])
    }

    fileMappings.push({
      field: val,
      fieldId: fieldId,
      msgType: msgType,
      originalId: originalId || '',
      change: hasChanged
    })
    form[fieldId] = formDetails[fieldId] || ''
  }

  if (files.length === 0) {
    // 如果沒有需要上傳的檔案，直接返回原始表單
    return form
  }

  const formData = new FormData()

  // 添加 bizTypes 參數，針對實際需要上傳的檔案
  for (const mapping of fileMappings) {
    if (mapping.change) {
      formData.append('msgTypes', mapping.msgType)
    }
  }

  // 添加檔案
  for (const file of files) {
    formData.append('files', file)
  }

  // 執行上傳操作
  try {
    const uploadResult = await uploadApi('/upload-multi', formData, {
      'content-type': 'multipart/form-data'
    })

    if (!uploadResult.success || uploadResult.code != '0000') {
      throw new Error(uploadResult.message || 'Upload failed')
    }

    // 使用 uploadResult.data 的索引更新表單欄位
    for (const mapping of fileMappings) {
      if (mapping.change) {
        // 如果有新檔案上傳，使用新的檔案 ID
        for (const val of uploadResult.data) {
          if (val.msgType == mapping.msgType) {
            form[mapping.fieldId] = val.fileId
          }
        }
      } else {
        // 否則繼續使用原來的 ID
        form[mapping.fieldId] = mapping.originalId
      }
    }

    return form
  } catch (error) {
    console.error('檔案上傳失敗', error)
    throw new Error('上傳檔案時發生錯誤', { cause: error })
  }
}
