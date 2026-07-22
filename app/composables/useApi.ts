import { useAuthStore } from '~/stores/authStore'

export const useApi = () => {
  const config = useRuntimeConfig()
  const authStore = useAuthStore()

  const fetchApi = async <T = any>(endpoint: string, options: any = {}): Promise<T> => {
    const token = authStore.token

    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...options.headers,
    }

    if (token) {
      headers.Authorization = `Bearer ${token}`
    }

    try {
      return await $fetch<T>(`${config.public.apiBase}${endpoint}`, {
        ...options,
        headers,
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
  }
}
