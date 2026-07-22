import { useAuthStore } from '~/stores/authStore'
import type { ApiResponse, User } from '~/types/models'

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()

  // If user profile is already loaded in memory, allow navigation
  if (authStore.user) return

  // On page refresh, user is gone from memory but laravel_session cookie is still alive.
  // Try to re-hydrate by calling /auth/me — the cookie authenticates it silently.
  if (import.meta.client && to.path !== '/login') {
    try {
      const config = useRuntimeConfig()
      // Read XSRF token for the request header
      const xsrfMatch = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
      const xsrf = xsrfMatch ? decodeURIComponent(xsrfMatch[1]) : null

      const headers: Record<string, string> = { Accept: 'application/json' }
      if (xsrf) headers['X-XSRF-TOKEN'] = xsrf

      const res = await $fetch<ApiResponse<User>>(`${config.public.apiBase}/auth/me`, {
        credentials: 'include',
        headers,
      })

      if (res.success && res.data) {
        authStore.setUser(res.data)
        return
      }
    } catch {
      // Session expired or no cookie — redirect to login
    }
    return navigateTo('/login')
  }
})
