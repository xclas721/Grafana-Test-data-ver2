import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getFrontTokenStrategy } from '@/shared/tokenStorage'
import { parseFrontRoleFromToken, type FrontRole } from '@/shared/utils/authToken'

export const useFrontAuthStore = defineStore('frontAuth', () => {
  const strategy = getFrontTokenStrategy()
  const token = ref<string | null>(strategy.get())
  const role = ref<FrontRole | null>(parseFrontRoleFromToken(token.value))

  const isAuthenticated = computed(() => Boolean(token.value))

  function setToken(value: string | null) {
    token.value = value
    role.value = parseFrontRoleFromToken(value)
    if (value) {
      strategy.set(value)
    } else {
      strategy.remove()
    }
  }

  function logout() {
    setToken(null)
  }

  return {
    token,
    role,
    isAuthenticated,
    setToken,
    logout
  }
})
