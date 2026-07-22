import { defineStore } from 'pinia'
import type { User } from '~/types/models'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Re-hydrate user profile from localStorage on page load.
   * Auth is validated server-side via the laravel_session HttpOnly cookie.
   */
  const initAuth = () => {
    if (import.meta.client) {
      const savedUser = localStorage.getItem('auth_user')
      if (savedUser) {
        try {
          user.value = JSON.parse(savedUser)
        } catch {
          user.value = null
        }
      }
    }
  }

  const setUser = (newUser: User) => {
    user.value = newUser
    if (import.meta.client) {
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    }
  }

  const logout = () => {
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_user')
    }
  }

  const hasRole = (roleName: string) => {
    return user.value?.roles?.includes(roleName.toUpperCase()) ?? false
  }

  return {
    user,
    isAuthenticated,
    initAuth,
    setUser,
    logout,
    hasRole,
  }
})
