import { defineStore } from 'pinia'
import type { Customer, ApiResponse } from '~/types/models'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadCustomers = async () => {
    isLoading.value = true
    try {
      const res = await fetchApi<ApiResponse<Customer[]>>('/customers')
      if (res.success) {
        customers.value = res.data
      }
    } catch (err) {
      console.error('Failed to load customers', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    customers,
    isLoading,
    loadCustomers,
  }
})
