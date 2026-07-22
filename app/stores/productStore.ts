import { defineStore } from 'pinia'
import type { Product, Category, Unit, ApiResponse } from '~/types/models'

export const useProductStore = defineStore('product', () => {
  const products = ref<Product[]>([])
  const categories = ref<Category[]>([])
  const units = ref<Unit[]>([])
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadCategories = async () => {
    try {
      const res = await fetchApi<ApiResponse<Category[]>>('/categories')
      if (res.success) {
        categories.value = res.data
      }
    } catch (err) {
      console.error('Failed to load categories', err)
    }
  }

  const loadUnits = async () => {
    try {
      const res = await fetchApi<ApiResponse<Unit[]>>('/units')
      if (res.success) {
        units.value = res.data
      }
    } catch (err) {
      console.error('Failed to load units', err)
    }
  }

  const loadProducts = async (filters: { search?: string; category_id?: string } = {}) => {
    isLoading.value = true
    try {
      const params = new URLSearchParams()
      if (filters.search) params.append('search', filters.search)
      if (filters.category_id) params.append('category_id', filters.category_id)

      const queryStr = params.toString() ? `?${params.toString()}` : ''
      const res = await fetchApi<ApiResponse<Product[]>>(`/products${queryStr}`)
      if (res.success) {
        products.value = res.data
      }
    } catch (err) {
      console.error('Failed to load products', err)
    } finally {
      isLoading.value = false
    }
  }

  return {
    products,
    categories,
    units,
    isLoading,
    loadCategories,
    loadUnits,
    loadProducts,
  }
})
