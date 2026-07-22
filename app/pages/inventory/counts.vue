<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Physical Stock Counting & Variance Adjustments</h1>
        <p class="text-sm text-slate-400">Compare physical shop stock with system stock & auto-generate adjustment movements</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
      >
        <span>📋 New Physical Count</span>
      </button>
    </div>

    <!-- Stock Counts List -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading stock count audit sessions...</p>
      </div>

      <div v-else-if="counts.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">📋</p>
        <p class="text-base font-semibold text-white">No physical stock counts recorded</p>
        <p class="text-sm text-slate-500 mt-1">Perform periodic physical stock counting to audit system inventory variance.</p>
      </div>

      <div v-else class="space-y-4 p-6">
        <div v-for="c in counts" :key="c.id" class="border border-slate-800 rounded-xl p-4 bg-slate-950/60 space-y-3">
          <div class="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <h3 class="font-bold text-white text-base">{{ c.title }}</h3>
              <p class="text-xs text-slate-400">Audited by {{ c.creator?.name || 'Staff' }} on {{ new Date(c.created_at).toLocaleString() }}</p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {{ c.status }}
            </span>
          </div>

          <div v-if="c.items && c.items.length > 0" class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="text-slate-500 border-b border-slate-800/80">
                <tr>
                  <th class="py-2">Product</th>
                  <th class="py-2">System Stock</th>
                  <th class="py-2">Physical Stock</th>
                  <th class="py-2">Variance (Difference)</th>
                  <th class="py-2">Reason</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                <tr v-for="item in c.items" :key="item.id">
                  <td class="py-2 font-semibold text-white">{{ item.product?.name }}</td>
                  <td class="py-2 text-slate-400">{{ item.system_quantity }} {{ item.product?.base_unit?.symbol }}</td>
                  <td class="py-2 font-bold text-white">{{ item.physical_quantity }} {{ item.product?.base_unit?.symbol }}</td>
                  <td class="py-2 font-bold" :class="Number(item.difference) < 0 ? 'text-rose-400' : (Number(item.difference) > 0 ? 'text-emerald-400' : 'text-slate-500')">
                    {{ Number(item.difference) > 0 ? '+' : '' }}{{ item.difference }}
                  </td>
                  <td class="py-2 text-slate-400 italic">{{ item.reason || 'None specified' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Physical Stock Count Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Perform Physical Stock Count</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateStockCount" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Session Title *</label>
            <input v-model="countForm.title" type="text" required placeholder="e.g., Weekly Cement Audit, Monthly Warehouse Count" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Notes / Observations</label>
            <textarea v-model="countForm.notes" rows="2" placeholder="Auditor notes..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"></textarea>
          </div>

          <!-- Items Count Form List -->
          <div class="space-y-3 pt-2 border-t border-slate-800">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-indigo-400 uppercase tracking-wider">Product Physical Counts</span>
              <button type="button" @click="addCountItemRow" class="text-xs font-semibold text-indigo-400 hover:text-indigo-300">+ Add Product</button>
            </div>

            <div v-for="(row, idx) in countForm.items" :key="idx" class="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
              <div class="flex items-center justify-between">
                <select v-model="row.product_id" required class="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs mr-2">
                  <option value="" disabled>Select Product</option>
                  <option v-for="p in productStore.products" :key="p.id" :value="p.id">{{ p.name }} (Base: {{ p.base_unit?.name }})</option>
                </select>
                <button v-if="countForm.items.length > 1" type="button" @click="removeCountItemRow(idx)" class="text-xs text-rose-400">✕</button>
              </div>

              <div class="grid grid-cols-2 gap-2">
                <div>
                  <label class="block text-[10px] text-slate-400 mb-1">Physical Base Qty Count *</label>
                  <input v-model.number="row.physical_quantity" type="number" step="0.001" min="0" required placeholder="Counted base qty" class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-bold" />
                </div>
                <div>
                  <label class="block text-[10px] text-slate-400 mb-1">Variance Reason</label>
                  <input v-model="row.reason" type="text" placeholder="e.g. Broken bags, Spillage" class="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs" />
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-4 border-t border-slate-800">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Complete Audit & Adjust Stock</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/productStore'
import type { StockCount, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const productStore = useProductStore()
const { fetchApi } = useApi()

const counts = ref<StockCount[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)

const countForm = reactive({
  title: '',
  notes: '',
  items: [
    { product_id: '', physical_quantity: 0, reason: '' }
  ]
})

const loadCounts = async () => {
  isLoading.value = true
  try {
    const res = await fetchApi<ApiResponse<StockCount[]>>('/inventory/counts')
    if (res.success) {
      counts.value = res.data
    }
  } catch (err) {
    console.error('Failed to load stock counts', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    loadCounts(),
    productStore.loadProducts()
  ])
})

const addCountItemRow = () => {
  countForm.items.push({ product_id: '', physical_quantity: 0, reason: '' })
}

const removeCountItemRow = (idx: number) => {
  countForm.items.splice(idx, 1)
}

const handleCreateStockCount = async () => {
  try {
    const res = await fetchApi<ApiResponse<any>>('/inventory/counts', {
      method: 'POST',
      body: countForm
    })

    if (res.success) {
      showCreateModal.value = false
      countForm.title = ''
      countForm.notes = ''
      countForm.items = [{ product_id: '', physical_quantity: 0, reason: '' }]
      await loadCounts()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to submit physical stock count')
  }
}
</script>
