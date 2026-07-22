<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Product Catalog</h1>
        <p class="text-sm text-slate-400">Manage products, base units & per-product measurement conversion rates</p>
      </div>
      <NuxtLink 
        to="/products/create" 
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center justify-center space-x-2"
      >
        <span>➕ Create Product</span>
      </NuxtLink>
    </div>

    <!-- Filters Bar -->
    <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4">
      <!-- Search Input -->
      <div class="relative flex-1 w-full">
        <span class="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">🔍</span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search products by name or barcode (e.g., Cement, Wire, NL-3INCH)..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition"
          @input="handleSearch"
        />
      </div>

      <!-- Category Filter -->
      <select 
        v-model="selectedCategory" 
        @change="handleSearch"
        class="w-full md:w-64 px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 text-sm focus:outline-none focus:border-indigo-500"
      >
        <option value="">All Categories</option>
        <option v-for="cat in productStore.categories" :key="cat.id" :value="cat.id">
          {{ cat.name }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="productStore.isLoading" class="p-12 text-center text-slate-400">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-sm">Loading product catalog...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="productStore.products.length === 0" class="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
      <p class="text-3xl mb-2">📦</p>
      <p class="text-base font-semibold text-white">No products found</p>
      <p class="text-sm text-slate-500 mt-1">Get started by creating your first construction material product.</p>
    </div>

    <!-- Products Cards List -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="product in productStore.products" 
        :key="product.id"
        class="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 flex flex-col justify-between transition shadow-lg"
      >
        <div>
          <!-- Top Badge & Status -->
          <div class="flex items-center justify-between mb-3">
            <span class="text-xs font-mono font-medium text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              {{ product.barcode || 'NO BARCODE' }}
            </span>
            <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {{ product.status }}
            </span>
          </div>

          <!-- Product Name & Description -->
          <h3 class="text-lg font-bold text-white mb-1">{{ product.name }}</h3>
          <p class="text-xs text-slate-400 mb-4 line-clamp-2">{{ product.description || 'No description provided.' }}</p>

          <!-- Categories Badges -->
          <div v-if="product.categories && product.categories.length > 0" class="flex flex-wrap gap-1.5 mb-4">
            <span 
              v-for="cat in product.categories" 
              :key="cat.id"
              class="text-[11px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md"
            >
              {{ cat.name }}
            </span>
          </div>

          <!-- Unit Conversions Matrix -->
          <div class="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 space-y-2 mb-4">
            <div class="text-[11px] uppercase font-bold text-indigo-400 tracking-wider flex items-center justify-between">
              <span>Measurement Units</span>
              <span>Base: {{ product.base_unit?.name }}</span>
            </div>

            <div class="space-y-1.5 pt-1">
              <div 
                v-for="pu in product.product_units" 
                :key="pu.id"
                class="flex items-center justify-between text-xs p-1.5 rounded-lg bg-slate-900 border border-slate-800/80"
              >
                <div class="flex items-center space-x-2">
                  <span class="font-bold text-white">{{ pu.unit?.name || 'Unit' }}</span>
                  <span class="text-slate-500 text-[10px]">(1 = {{ pu.conversion_rate }} {{ product.base_unit?.name }})</span>
                </div>
                <div class="font-semibold text-emerald-400">
                  {{ pu.selling_price }} ETB
                  <span v-if="pu.is_default" class="ml-1 text-[9px] bg-indigo-500/20 text-indigo-300 px-1 py-0.2 rounded">DEFAULT</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Card Footer -->
        <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <span>Min Alert: {{ product.min_stock_alert }} {{ product.base_unit?.symbol }}</span>
          <button 
            @click="openAddUnitModal(product)"
            class="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
          >
            <span>+ Add Unit</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Add Unit Conversion Modal -->
    <div v-if="activeProductModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Add Unit for {{ activeProductModal.name }}</h3>
          <button @click="activeProductModal = null" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="submitAddUnit" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Select Measurement Unit</label>
            <select v-model="unitForm.unit_id" required class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="" disabled>Select Unit</option>
              <option v-for="u in productStore.units" :key="u.id" :value="u.id">{{ u.name }} ({{ u.symbol }})</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Conversion Rate to Base Unit ({{ activeProductModal.base_unit?.name }})</label>
            <input v-model.number="unitForm.conversion_rate" type="number" step="0.001" min="0.001" required placeholder="e.g. 100 for Bundle = 100 Pcs" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Selling Price (ETB)</label>
            <input v-model.number="unitForm.selling_price" type="number" step="0.01" min="0" required placeholder="Selling price for this unit" class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="activeProductModal = null" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-500">Save Unit</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/productStore'
import type { Product, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const productStore = useProductStore()
const { fetchApi } = useApi()

const searchQuery = ref('')
const selectedCategory = ref('')
const activeProductModal = ref<Product | null>(null)

const unitForm = reactive({
  unit_id: '',
  conversion_rate: 1,
  selling_price: 0,
  is_default: false
})

onMounted(async () => {
  await Promise.all([
    productStore.loadCategories(),
    productStore.loadUnits(),
    productStore.loadProducts()
  ])
})

const handleSearch = () => {
  productStore.loadProducts({
    search: searchQuery.value,
    category_id: selectedCategory.value
  })
}

const openAddUnitModal = (product: Product) => {
  activeProductModal.value = product
  unitForm.unit_id = ''
  unitForm.conversion_rate = 1
  unitForm.selling_price = 0
}

const submitAddUnit = async () => {
  if (!activeProductModal.value) return

  try {
    const res = await fetchApi<ApiResponse<any>>(`/products/${activeProductModal.value.id}/units`, {
      method: 'POST',
      body: unitForm
    })

    if (res.success) {
      activeProductModal.value = null
      await productStore.loadProducts()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to add unit conversion')
  }
}
</script>
