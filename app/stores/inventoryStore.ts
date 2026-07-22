import { defineStore } from 'pinia'
import type { InventoryBatch, StockMovement, ApiResponse } from '~/types/models'

export const useInventoryStore = defineStore('inventory', () => {
  const activeBatches = ref<InventoryBatch[]>([])
  const movements = ref<StockMovement[]>([])
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadActiveBatches = async (productId?: string) => {
    isLoading.value = true
    try {
      const query = productId ? `?product_id=${productId}` : ''
      const res = await fetchApi<ApiResponse<InventoryBatch[]>>(`/inventory/batches${query}`)
      if (res.success) {
        activeBatches.value = res.data
      }
    } catch (err) {
      console.error('Failed to load active batches', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadMovements = async (productId?: string) => {
    isLoading.value = true
    try {
      const query = productId ? `?product_id=${productId}` : ''
      const res = await fetchApi<ApiResponse<StockMovement[]>>(`/inventory/movements${query}`)
      if (res.success) {
        movements.value = res.data
      }
    } catch (err) {
      console.error('Failed to load stock movements', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    activeBatches,
    movements,
    isLoading,
    loadActiveBatches,
    loadMovements,
  }
})
