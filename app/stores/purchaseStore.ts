import { defineStore } from 'pinia'
import type { Purchase, ApiResponse } from '~/types/models'

export const usePurchaseStore = defineStore('purchase', () => {
  const purchases = ref<Purchase[]>([])
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadPurchases = async () => {
    isLoading.value = true
    try {
      const res = await fetchApi<ApiResponse<Purchase[]>>('/purchases')
      if (res.success) {
        purchases.value = res.data
      }
    } catch (err) {
      console.error('Failed to load purchases', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    purchases,
    isLoading,
    loadPurchases,
  }
})
