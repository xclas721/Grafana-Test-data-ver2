import { defineStore } from 'pinia'
import { useStorage } from '@vueuse/core'

export const useThemeStore = defineStore('theme', () => {
  // 可用的主題列表（精選）
  const availableThemes = [
    'brainwave', // 自訂主題
    'brainwave-dark', // 自訂主題 (深色)
    'light', // 淺色
    'dark', // 深色
    'night', // 夜晚
    'cmyk', // CMYK
    'business', // 商務
    'sunset', // 日落
    'abyss', // 深淵
    'silk' // 絲綢
  ]

  // 當前主題（使用 localStorage 持久化）
  const currentTheme = useStorage('theme', 'brainwave')

  /**
   * 設定主題
   */
  function setTheme(theme: string) {
    if (availableThemes.includes(theme)) {
      currentTheme.value = theme
      // 更新 HTML 的 data-theme 屬性
      document.documentElement.setAttribute('data-theme', theme)
    }
  }

  /**
   * 初始化主題（在應用啟動時調用）
   */
  function initTheme() {
    const theme = currentTheme.value || 'brainwave'
    setTheme(theme)
  }

  /**
   * 切換到下一個主題
   */
  function nextTheme() {
    const current = currentTheme.value || 'brainwave'
    const currentIndex = availableThemes.indexOf(current)
    const nextIndex = (currentIndex + 1) % availableThemes.length
    setTheme(availableThemes[nextIndex] || 'brainwave')
  }

  return {
    availableThemes,
    currentTheme,
    setTheme,
    initTheme,
    nextTheme
  }
})
