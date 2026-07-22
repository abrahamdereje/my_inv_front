import { defineStore } from 'pinia'
import type { User, ApiResponse } from '~/types/models'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null)
  const user = ref<User | null>(null)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Initialize store from localStorage on client side
  const initAuth = () => {
    if (import.meta.client) {
      const savedToken = localStorage.getItem('auth_token')
      const savedUser = localStorage.getItem('auth_user')
      if (savedToken && savedUser) {
        token.value = savedToken
        try {
          user.value = JSON.parse(savedUser)
        } catch {
          token.value = null;
          user.value = null;
        }
      }
    }
  }

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken
    user.value = newUser
    if (import.meta.client) {
      localStorage.setItem('auth_token', newToken)
      localStorage.setItem('auth_user', JSON.stringify(newUser))
    }
  }

  const logout = () => {
    token.value = null
    user.value = null
    if (import.meta.client) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
    }
  }

  const hasRole = (roleName: string) => {
    return user.value?.roles?.includes(roleName.toUpperCase()) ?? false
  }

  return {
    token,
    user,
    isAuthenticated,
    initAuth,
    setAuth,
    logout,
    hasRole,
  }
})
