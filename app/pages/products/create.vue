<template>
  <div class="max-w-3xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Create Construction Product</h1>
        <p class="text-sm text-slate-400">Set up product details, category mappings & per-product unit conversions</p>
      </div>
      <NuxtLink to="/products" class="text-sm font-semibold text-slate-400 hover:text-white">
        ← Back to Catalog
      </NuxtLink>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="handleSubmit" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
      <!-- General Product Information -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
          1. General Product Details
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
            <input 
              v-model="form.name" 
              type="text" 
              required 
              placeholder="e.g., Nail 3 inch, Cement 50kg, Wire 2.5mm"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Barcode / SKU</label>
            <input 
              v-model="form.barcode" 
              type="text" 
              placeholder="e.g., NL-3INCH-001"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-1">Description</label>
          <textarea 
            v-model="form.description" 
            rows="2"
            placeholder="Detailed specifications, brand info, or material grade..."
            class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
          ></textarea>
        </div>

        <!-- Categories Selection -->
        <div>
          <label class="block text-xs font-semibold text-slate-300 mb-2">Categories</label>
          <div class="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-3 rounded-xl bg-slate-950 border border-slate-800">
            <label 
              v-for="cat in productStore.categories" 
              :key="cat.id"
              class="inline-flex items-center space-x-2 text-xs bg-slate-900 hover:bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-800 cursor-pointer"
            >
              <input 
                type="checkbox" 
                :value="cat.id" 
                v-model="form.category_ids"
                class="rounded border-slate-700 text-indigo-600 focus:ring-0"
              />
              <span>{{ cat.name }}</span>
            </label>
          </div>
        </div>
      </div>

      <!-- Base Unit & Base Selling Price Setup -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
          2. Base Unit & Default Selling Price
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Base Measurement Unit *</label>
            <select 
              v-model="form.base_unit_id" 
              required 
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Select Base Unit</option>
              <option v-for="u in productStore.units" :key="u.id" :value="u.id">
                {{ u.name }} ({{ u.symbol }})
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Base Selling Price (ETB) *</label>
            <input 
              v-model.number="form.base_selling_price" 
              type="number" 
              step="0.01" 
              min="0" 
              required 
              placeholder="0.00"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Low Stock Alert Threshold</label>
            <input 
              v-model.number="form.min_stock_alert" 
              type="number" 
              step="0.001" 
              min="0" 
              placeholder="Minimum base quantity"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- Additional Measurement Conversions -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400">
            3. Additional Measurement Units & Conversions
          </h3>
          <button 
            type="button" 
            @click="addAdditionalUnit"
            class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>+ Add Unit Conversion</span>
          </button>
        </div>

        <p class="text-xs text-slate-400">
          Example: If Base Unit is <strong>Piece</strong>, add <strong>Bundle</strong> (100 pieces) or <strong>KG</strong> (250 pieces) with custom selling prices.
        </p>

        <div v-if="form.units.length === 0" class="p-4 rounded-xl bg-slate-950/60 border border-dashed border-slate-800 text-center text-xs text-slate-500">
          No additional unit conversions added yet. Click above to add Bundle, KG, Roll, or Bag rates.
        </div>

        <div v-else class="space-y-3">
          <div 
            v-for="(unitRow, index) in form.units" 
            :key="index"
            class="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-4 gap-3 items-end"
          >
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Unit</label>
              <select v-model="unitRow.unit_id" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs">
                <option value="" disabled>Select Unit</option>
                <option v-for="u in productStore.units" :key="u.id" :value="u.id">{{ u.name }} ({{ u.symbol }})</option>
              </select>
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Conversion Rate (to Base Unit)</label>
              <input v-model.number="unitRow.conversion_rate" type="number" step="0.001" min="0.001" required placeholder="e.g. 100" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs" />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Selling Price (ETB)</label>
              <input v-model.number="unitRow.selling_price" type="number" step="0.01" min="0" required placeholder="Price" class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs" />
            </div>

            <div class="flex items-center justify-end pb-1">
              <button type="button" @click="removeUnitRow(index)" class="text-xs text-rose-400 hover:text-rose-300 font-medium">Remove ✕</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit Actions -->
      <div class="pt-4 border-t border-slate-800 flex items-center justify-end space-x-4">
        <NuxtLink to="/products" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm">
          Cancel
        </NuxtLink>
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Creating...' : 'Save Product' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/productStore'
import type { ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const productStore = useProductStore()
const { fetchApi } = useApi()

const isSubmitting = ref(false)

const form = reactive({
  name: '',
  barcode: '',
  description: '',
  base_unit_id: '',
  base_selling_price: 0,
  min_stock_alert: 0,
  category_ids: [] as string[],
  units: [] as Array<{ unit_id: string; conversion_rate: number; selling_price: number; is_default: boolean }>
})

onMounted(async () => {
  await Promise.all([
    productStore.loadCategories(),
    productStore.loadUnits()
  ])
  if (productStore.units.length > 0 && !form.base_unit_id) {
    form.base_unit_id = productStore.units[0].id
  }
})

const addAdditionalUnit = () => {
  form.units.push({
    unit_id: '',
    conversion_rate: 10,
    selling_price: 0,
    is_default: false
  })
}

const removeUnitRow = (index: number) => {
  form.units.splice(index, 1)
}

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const res = await fetchApi<ApiResponse<any>>('/products', {
      method: 'POST',
      body: form
    })

    if (res.success) {
      await productStore.loadProducts()
      navigateTo('/products')
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to create product')
  } finally {
    isSubmitting.value = false
  }
}
</script>
