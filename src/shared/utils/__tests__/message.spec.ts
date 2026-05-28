import { beforeEach, describe, expect, it, vi } from 'vitest'

const swal = vi.hoisted(() => ({
  fire: vi.fn()
}))

vi.mock('sweetalert2', () => ({
  default: {
    fire: swal.fire
  }
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => {
    throw new Error('outside setup')
  }
}))

import { message } from '@/shared/utils/message'

/**
 * message：SweetAlert2 包裝（§4.0）。`useI18n` 拋錯時走 getI18n fallback。
 */
describe('message', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    swal.fire.mockResolvedValue({ isConfirmed: true })
  })

  describe('success', () => {
    it('應呼叫 Swal.fire 並帶 success、timer', async () => {
      await message.success('儲存完成')

      expect(swal.fire).toHaveBeenCalledOnce()
      const arg = swal.fire.mock.calls[0][0] as Record<string, unknown>
      expect(arg.text).toBe('儲存完成')
      expect(arg.icon).toBe('success')
      expect(arg.timer).toBe(3000)
      expect(String(arg.customClass && (arg.customClass as any).confirmButton)).toContain(
        'btn-success'
      )
    })

    it('自訂 title 應覆寫預設標題', async () => {
      await message.success('內文', '標')
      const arg = swal.fire.mock.calls[0][0] as Record<string, unknown>
      expect(arg.title).toBe('標')
      expect(arg.text).toBe('內文')
    })
  })

  describe('info', () => {
    it('應帶 info 與 timer', async () => {
      await message.info('說明')
      const arg = swal.fire.mock.calls[0][0] as Record<string, unknown>
      expect(arg.icon).toBe('info')
      expect(arg.timer).toBe(3000)
    })
  })

  describe('warn', () => {
    it('應帶 warning 且無 timer', async () => {
      await message.warn('注意')
      const arg = swal.fire.mock.calls[0][0] as Record<string, unknown>
      expect(arg.icon).toBe('warning')
      expect(arg.timer).toBeUndefined()
    })
  })

  describe('error', () => {
    it('確認後應執行 callback', async () => {
      const cb = vi.fn()
      await message.error('錯誤', '標', cb)
      expect(cb).toHaveBeenCalledOnce()
    })

    it('未確認時不應呼叫 callback', async () => {
      swal.fire.mockResolvedValue({ isConfirmed: false })
      const cb = vi.fn()
      await message.error('錯誤', '標', cb)
      expect(cb).not.toHaveBeenCalled()
    })
  })

  describe('confirm', () => {
    it('應顯示取消鈕並回傳 isConfirmed', async () => {
      const result = await message.confirm('確定刪除？')
      expect(result).toBe(true)
      const arg = swal.fire.mock.calls[0][0] as Record<string, unknown>
      expect(arg.showCancelButton).toBe(true)
      expect(arg.cancelButtonText).toBe('取消')
    })

    it('取消時回 false 且不呼叫 callback', async () => {
      swal.fire.mockResolvedValue({ isConfirmed: false })
      const cb = vi.fn()
      const result = await message.confirm('？', '標', cb)
      expect(result).toBe(false)
      expect(cb).not.toHaveBeenCalled()
    })

    it('確認且提供 callback 應執行', async () => {
      const cb = vi.fn()
      await message.confirm('？', '標', cb)
      expect(cb).toHaveBeenCalledOnce()
    })
  })
})
