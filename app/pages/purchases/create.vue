<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Record Stock Purchase</h1>
        <p class="text-sm text-slate-400">Receive inventory, generate FIFO stock batches & post supplier credit debt</p>
      </div>
      <NuxtLink to="/purchases" class="text-sm font-semibold text-slate-400 hover:text-white">
        ← Back to Invoices
      </NuxtLink>
    </div>

    <!-- Form Container -->
    <form @submit.prevent="handleSubmit" class="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-xl">
      <!-- 1. Header Information -->
      <div class="space-y-4">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400 border-b border-slate-800 pb-2">
          1. Invoice Header
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Supplier / Factory *</label>
            <select 
              v-model="form.supplier_id" 
              required 
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            >
              <option value="" disabled>Select Supplier</option>
              <option v-for="s in supplierStore.suppliers" :key="s.id" :value="s.id">
                {{ s.name }} (Debt: {{ s.current_debt }} ETB)
              </option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Invoice / Reference Number *</label>
            <input 
              v-model="form.invoice_number" 
              type="text" 
              required 
              placeholder="e.g., INV-1001"
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 text-sm"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Purchase Date *</label>
            <input 
              v-model="form.purchase_date" 
              type="date" 
              required 
              class="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>
      </div>

      <!-- 2. Purchased Stock Line Items -->
      <div class="space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400">
            2. Received Items (FIFO Batches)
          </h3>
          <button 
            type="button" 
            @click="addItemRow"
            class="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
          >
            <span>+ Add Material Line</span>
          </button>
        </div>

        <div v-for="(item, index) in form.items" :key="index" class="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
            <!-- Select Product -->
            <div class="md:col-span-2">
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Product *</label>
              <select 
                v-model="item.product_id" 
                @change="onProductSelect(index)"
                required 
                class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs"
              >
                <option value="" disabled>Select Material Product</option>
                <option v-for="p in productStore.products" :key="p.id" :value="p.id">
                  {{ p.name }} (Base: {{ p.base_unit?.name }})
                </option>
              </select>
            </div>

            <!-- Select Unit -->
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Unit *</label>
              <select v-model="item.unit_id" required class="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs">
                <option value="" disabled>Select Unit</option>
                <option v-for="u in getAvailableUnitsForProduct(item.product_id)" :key="u.id" :value="u.id">
                  {{ u.name }}
                </option>
              </select>
            </div>

            <!-- Remove Button -->
            <div class="flex items-center justify-end">
              <button v-if="form.items.length > 1" type="button" @click="removeItemRow(index)" class="text-xs text-rose-400 hover:text-rose-300">
                Remove Line ✕
              </button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-slate-800/60">
            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Quantity Received *</label>
              <input v-model.number="item.quantity" type="number" step="0.001" min="0.001" required placeholder="Qty" class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs" />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Unit Purchase Cost (ETB) *</label>
              <input v-model.number="item.unit_cost" type="number" step="0.01" min="0" required placeholder="Cost per unit" class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs" />
            </div>

            <div>
              <label class="block text-[11px] font-semibold text-slate-400 mb-1">Line Total</label>
              <div class="px-3 py-1.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-emerald-400 font-bold text-xs">
                {{ (item.quantity * item.unit_cost).toFixed(2) }} ETB
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. Payment & Credit Calculation -->
      <div class="space-y-4 pt-2 border-t border-slate-800">
        <h3 class="text-sm font-bold uppercase tracking-wider text-indigo-400">
          3. Payment Details & Supplier Credit
        </h3>

        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <span class="block text-xs font-semibold text-slate-400 mb-1">Total Invoice Amount</span>
            <span class="text-xl font-bold text-white">{{ calculatedTotal.toFixed(2) }} ETB</span>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-1">Paid Amount (ETB) *</label>
            <input 
              v-model.number="form.paid_amount" 
              type="number" 
              step="0.01" 
              min="0" 
              required 
              placeholder="0.00"
              class="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <span class="block text-xs font-semibold text-slate-400 mb-1">Remaining Debt to Supplier</span>
            <span 
              class="text-xl font-bold"
              :class="calculatedRemaining > 0 ? 'text-rose-400' : 'text-slate-400'"
            >
              {{ calculatedRemaining.toFixed(2) }} ETB
            </span>
          </div>
        </div>
      </div>

      <!-- Submit Actions -->
      <div class="pt-4 border-t border-slate-800 flex items-center justify-end space-x-4">
        <NuxtLink to="/purchases" class="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm">
          Cancel
        </NuxtLink>
        <button 
          type="submit" 
          :disabled="isSubmitting"
          class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Processing Invoice...' : 'Post Purchase Invoice' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { useSupplierStore } from '~/stores/supplierStore'
import { useProductStore } from '~/stores/productStore'
import type { ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const supplierStore = useSupplierStore()
const productStore = useProductStore()
const { fetchApi } = useApi()

const isSubmitting = ref(false)

const form = reactive({
  supplier_id: '',
  invoice_number: '',
  purchase_date: new Date().toISOString().split('T')[0],
  paid_amount: 0,
  items: [
    { product_id: '', unit_id: '', quantity: 1, unit_cost: 0 }
  ]
})

onMounted(async () => {
  await Promise.all([
    supplierStore.loadSuppliers(),
    productStore.loadProducts(),
    productStore.loadUnits()
  ])
})

const getAvailableUnitsForProduct = (productId: string) => {
  const p = productStore.products.find(x => x.id === productId)
  if (!p) return productStore.units
  if (p.product_units && p.product_units.length > 0) {
    return p.product_units.map(pu => pu.unit!).filter(Boolean)
  }
  return p.base_unit ? [p.base_unit] : productStore.units
}

const onProductSelect = (index: number) => {
  const productId = form.items[index].product_id
  const units = getAvailableUnitsForProduct(productId)
  if (units.length > 0) {
    form.items[index].unit_id = units[0].id
  }
}

const addItemRow = () => {
  form.items.push({ product_id: '', unit_id: '', quantity: 1, unit_cost: 0 })
}

const removeItemRow = (index: number) => {
  form.items.splice(index, 1)
}

const calculatedTotal = computed(() => {
  return form.items.reduce((sum, item) => sum + (item.quantity * item.unit_cost), 0)
})

const calculatedRemaining = computed(() => {
  return Math.max(0, calculatedTotal.value - form.paid_amount)
})

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    const res = await fetchApi<ApiResponse<any>>('/purchases', {
      method: 'POST',
      body: form
    })

    if (res.success) {
      navigateTo('/purchases')
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to post purchase invoice')
  } finally {
    isSubmitting.value = false
  }
}
</script>
