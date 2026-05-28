import Swal from 'sweetalert2'
import { useI18n } from 'vue-i18n'

type MessageFn = (message: string, title?: string) => Promise<any>

const getI18n = () => {
  try {
    return useI18n()
  } catch {
    // 如果不在組件中使用，返回預設值
    return { t: (key: string, fallback?: string) => fallback || key }
  }
}

const baseOptions = (
  title: string,
  text: string,
  icon: 'success' | 'info' | 'warning' | 'error',
  buttonClass: string = 'btn btn-primary'
) => {
  const { t } = getI18n()
  // 為實心按鈕添加白色文字（outline 按鈕保持原樣）
  const finalButtonClass = buttonClass.includes('btn-outline')
    ? buttonClass
    : `${buttonClass} text-white`

  return {
    title,
    text,
    icon,
    buttonsStyling: false,
    backdrop: false,
    heightAuto: false,
    confirmButtonText: t('ui.login.submit', '確認'),
    customClass: {
      confirmButton: finalButtonClass
    }
  } as const
}

export const message = {
  success: ((msg, title) => {
    const { t } = getI18n()
    return Swal.fire({
      ...baseOptions(title || t('ui.message.info', '成功'), msg, 'success', 'btn btn-success'),
      timer: 3000
    })
  }) as MessageFn,

  info: ((msg, title) => {
    const { t } = getI18n()
    return Swal.fire({
      ...baseOptions(title || t('ui.message.info', '提示'), msg, 'info', 'btn btn-info'),
      timer: 3000
    })
  }) as MessageFn,

  warn: ((msg, title) => {
    const { t } = getI18n()
    return Swal.fire({
      ...baseOptions(title || t('ui.message.warn', '警告'), msg, 'warning', 'btn btn-warning')
    })
  }) as MessageFn,

  error: ((msg, title, callback?: () => void) => {
    const { t } = getI18n()
    return Swal.fire({
      ...baseOptions(title || t('ui.message.error', '錯誤'), msg, 'error', 'btn btn-error')
    }).then((result) => {
      if (result.isConfirmed && callback) {
        callback()
      }
    })
  }) as MessageFn & { (msg: string, title?: string, callback?: () => void): Promise<any> },

  confirm: async (msg: string, title?: string, callback?: () => void) => {
    const { t } = getI18n()
    const result = await Swal.fire({
      ...baseOptions(title || t('ui.message.warn', '確認'), msg, 'warning'),
      showCancelButton: true,
      cancelButtonText: t('btn.cancel', '取消'),
      customClass: {
        confirmButton: 'btn btn-primary text-white',
        cancelButton: 'btn btn-outline'
      }
    })
    if (result.isConfirmed && callback) {
      callback()
    }
    return result.isConfirmed
  }
}
