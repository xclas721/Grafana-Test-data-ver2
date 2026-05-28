import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { getAuthTokenStrategy } from '@/shared/tokenStorage'
import { parseAdminRoleFromToken, type AdminRole } from '@/shared/utils/authToken'

type AuthUser = {
  name?: string
  email?: string
}

export const useAuthStore = defineStore('auth', () => {
  const strategy = getAuthTokenStrategy()
  const token = ref<string | null>(strategy.get())
  const role = ref<AdminRole | null>(parseAdminRoleFromToken(token.value))
  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => Boolean(token.value))
  const canEdit = computed(() => role.value === 'ADMIN' || role.value === 'EDITOR')
  const canDelete = computed(() => role.value === 'ADMIN')

  function setToken(value: string | null) {
    token.value = value
    role.value = parseAdminRoleFromToken(value)
    if (value) {
      strategy.set(value)
    } else {
      strategy.remove()
    }
  }

  function logout() {
    setToken(null)
    user.value = null
  }

  function setUser(value: AuthUser | null) {
    user.value = value
  }

  return {
    token,
    role,
    user,
    isAuthenticated,
    canEdit,
    canDelete,
    setUser,
    setToken,
    logout
  }
})
