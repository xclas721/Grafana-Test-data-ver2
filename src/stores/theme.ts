import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  const availableThemes = ['brainwave', 'brainwave-dark'] as const
  type AppTheme = (typeof availableThemes)[number]

  function isAppTheme(theme: string): theme is AppTheme {
    return (availableThemes as readonly string[]).includes(theme)
  }

  // 當前主題（使用 localStorage 持久化）
  const currentTheme = useStorage('theme', 'brainwave')

  /**
   * 設定主題
   */
  function setTheme(theme: string) {
    if (isAppTheme(theme)) {
      currentTheme.value = theme
      document.documentElement.setAttribute('data-theme', theme)
      document.documentElement.style.colorScheme = theme === 'brainwave-dark' ? 'dark' : 'light'
    }
  }

  /**
   * 初始化主題（在應用啟動時調用）
   */
  function initTheme() {
    const stored = currentTheme.value || 'brainwave'
    const theme = isAppTheme(stored) ? stored : 'brainwave'
    if (theme !== stored) currentTheme.value = theme
    setTheme(theme)
  }

  /**
   * 切換到下一個主題
   */
  function nextTheme() {
    const current = currentTheme.value || 'brainwave'
    const currentIndex = isAppTheme(current) ? availableThemes.indexOf(current) : -1
    const nextIndex = (currentIndex + 1) % availableThemes.length
    setTheme(availableThemes[nextIndex] || 'brainwave')
  }

  function isDarkMode(): boolean {
    return currentTheme.value === 'brainwave-dark'
  }

  function toggleTheme() {
    setTheme(isDarkMode() ? 'brainwave' : 'brainwave-dark')
  }

  return {
    availableThemes,
    currentTheme,
    setTheme,
    initTheme,
    nextTheme,
    isDarkMode,
    toggleTheme
  }
})
