import { describe, expect, it } from 'vitest'
import { usePagination, type PageResponse } from '@/shared/utils/pagination'

/**
 * usePagination：與後端 PageResponse 對齊與頁碼邊界（§4.0）。
 */
describe('usePagination', () => {
  it('自訂 initialPageSize 應寫入 pageSize', () => {
    const p = usePagination(25)
    expect(p.pageSize.value).toBe(25)
    expect(p.currentPage.value).toBe(1)
  })

  it('updateFromResponse 應同步 totalItems、後端 0-based 轉前端 1-based', () => {
    const p = usePagination(10)
    const res: PageResponse<string> = {
      content: [],
      currentPage: 2,
      pageSize: 10,
      totalItems: 45,
      totalPages: 5,
      hasPrevious: true,
      hasNext: true,
      first: false,
      last: false
    }
    p.updateFromResponse(res)
    expect(p.totalItems.value).toBe(45)
    expect(p.currentPage.value).toBe(3)
    expect(p.pageSize.value).toBe(10)
  })

  it('totalPages 應依 totalItems 與 pageSize 計算', () => {
    const p = usePagination(10)
    p.totalItems.value = 25
    expect(p.totalPages.value).toBe(3)
  })

  it('resetPage 應回到第 1 頁', () => {
    const p = usePagination(10)
    p.currentPage.value = 5
    p.resetPage()
    expect(p.currentPage.value).toBe(1)
  })

  it('goToPage 應在 1..totalPages 內才更新', () => {
    const p = usePagination(10)
    p.totalItems.value = 30
    p.goToPage(0)
    expect(p.currentPage.value).toBe(1)
    p.goToPage(4)
    expect(p.currentPage.value).toBe(1)
    p.goToPage(2)
    expect(p.currentPage.value).toBe(2)
    p.goToPage(3)
    expect(p.currentPage.value).toBe(3)
  })
})
