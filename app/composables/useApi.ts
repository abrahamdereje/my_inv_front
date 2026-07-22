import { useAuthStore } from '~/stores/authStore'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  /**
   * Read the XSRF-TOKEN cookie value (set by Sanctum's csrf-cookie endpoint).
   * This must be sent as X-XSRF-TOKEN header on all mutating requests.
   */
  const getXsrfToken = (): string | null => {
    if (!import.meta.client) return null
    const match = document.cookie.match(/(?:^|;\s*)XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
  }

  /**
   * Initialize Sanctum SPA auth by fetching the CSRF cookie.
   * Must be called once before the first login attempt.
   */
  const initCsrf = async () => {
    await $fetch(`${config.public.backendBase}/sanctum/csrf-cookie`, {
      credentials: 'include',
    })
  }

  const fetchApi = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const xsrf = getXsrfToken()

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    // XSRF header is required for all state-changing requests (POST/PUT/DELETE)
    if (xsrf) {
      headers['X-XSRF-TOKEN'] = xsrf
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        ...options,
        headers,
        credentials: 'include',  // Always send laravel_session + XSRF cookies
      })
    } catch (err: any) {
      if (err?.status === 401) {
        authStore.logout()
        navigateTo('/login')
      }
      throw err
    }
  }

  return {
    fetchApi,
    initCsrf,
  }
}
