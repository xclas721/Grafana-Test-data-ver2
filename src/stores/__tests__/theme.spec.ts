import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import type { Ref } from 'vue'
import { nextTick, unref } from 'vue'
import { useThemeStore } from '@/stores/theme'

/**
 * theme store（§4.0）
 */
describe('theme store', () => {
  beforeEach(() => {
    localStorage.removeItem('theme')
    document.documentElement.removeAttribute('data-theme')
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.removeItem('theme')
    document.documentElement.removeAttribute('data-theme')
  })

  describe('setTheme', () => {
    it('合法主題應寫入 storage 與 data-theme', async () => {
      const s = useThemeStore()
      s.setTheme('brainwave-dark')
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave-dark')
      expect(document.documentElement.getAttribute('data-theme')).toBe('brainwave-dark')
      expect(document.documentElement.style.colorScheme).toBe('dark')
      const raw = localStorage.getItem('theme')
      expect(raw === 'brainwave-dark' || raw === JSON.stringify('brainwave-dark')).toBe(true)
    })

    it('不在清單內的主題應忽略', async () => {
      const s = useThemeStore()
      s.setTheme('brainwave')
      s.setTheme('not-a-real-theme')
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave')
      expect(document.documentElement.getAttribute('data-theme')).toBe('brainwave')
    })
  })

  describe('initTheme', () => {
    it('無 storage 時應套用 brainwave', async () => {
      const s = useThemeStore()
      s.initTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave')
      expect(document.documentElement.getAttribute('data-theme')).toBe('brainwave')
    })
  })

  describe('toggleTheme', () => {
    it('應在 brainwave 與 brainwave-dark 之間切換', async () => {
      const s = useThemeStore()
      s.setTheme('brainwave')
      s.toggleTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave-dark')
      s.toggleTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave')
    })
  })

  describe('nextTheme', () => {
    it('應循環到下一個主題', async () => {
      const s = useThemeStore()
      s.setTheme('brainwave')
      s.nextTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave-dark')
      s.nextTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave')
    })

    it('storage 為已移除主題時 initTheme 應回退 brainwave', async () => {
      localStorage.setItem('theme', 'dark')
      const s = useThemeStore()
      s.initTheme()
      await nextTick()
      expect(unref(s.currentTheme as unknown as Ref<string>)).toBe('brainwave')
      expect(document.documentElement.getAttribute('data-theme')).toBe('brainwave')
    })
  })
})
