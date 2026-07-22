import { defineStore } from 'pinia'
import type { Supplier, ApiResponse } from '~/types/models'

export const useSupplierStore = defineStore('supplier', () => {
  const suppliers = ref<Supplier[]>([])
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadSuppliers = async () => {
    isLoading.value = true
    try {
      const res = await fetchApi<ApiResponse<Supplier[]>>('/suppliers')
      if (res.success) {
        suppliers.value = res.data
      }
    } catch (err) {
      console.error('Failed to load suppliers', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    suppliers,
    isLoading,
    loadSuppliers,
  }
})
