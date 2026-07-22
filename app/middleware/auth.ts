import { useAuthStore } from '~/stores/authStore'

export default defineNuxtRouteMiddleware((to, from) => {
  const authStore = useAuthStore()

  if (import.meta.client && !authStore.token && to.path !== '/login') {
    return navigateTo('/login')
  }
})
