import { defineStore } from 'pinia'
import type { Product, ProductUnit, Customer, Sale, ApiResponse } from '~/types/models'

export interface CartItem {
  product: Product
  unit: ProductUnit
  quantity: number
  selling_price: number;
}

export const usePosStore = defineStore('pos', () => {
  const posProducts = ref<Product[]>([])
  const cart = ref<CartItem[]>([])
  const selectedCustomerId = ref<string | null>(null)
  const paidAmount = ref<number>(0)
  const isLoading = ref(false)

  const { fetchApi } = useApi()

  const loadPosProducts = async () => {
    isLoading.value = true
    try {
      const res = await fetchApi<ApiResponse<Product[]>>('/pos/products')
      if (res.success) {
        posProducts.value = res.data
      }
    } catch (err) {
      console.error('Failed to load POS products', err)
    } finally {
      isLoading.value = false
    }
  }

  const addToCart = (product: Product, unit: ProductUnit, quantity: number = 1) => {
    const existingIndex = cart.value.findIndex(
      item => item.product.id === product.id && item.unit.unit_id === unit.unit_id
    )

    if (existingIndex > -1) {
      cart.value[existingIndex].quantity += quantity
    } else {
      cart.value.push({
        product,
        unit,
        quantity,
        selling_price: Number(unit.selling_price)
      })
    }
  }

  const updateQuantity = (index: number, qty: number) => {
    if (qty <= 0) {
      cart.value.splice(index, 1)
    } else {
      cart.value[index].quantity = qty
    }
  }

  const removeFromCart = (index: number) => {
    cart.value.splice(index, 1)
  }

  const clearCart = () => {
    cart.value = []
    selectedCustomerId.value = null
    paidAmount.value = 0
  }

  const cartTotal = computed(() => {
    return cart.value.reduce((sum, item) => sum + (item.quantity * item.selling_price), 0)
  })

  return {
    posProducts,
    cart,
    selectedCustomerId,
    paidAmount,
    isLoading,
    cartTotal,
    loadPosProducts,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
  }
})
