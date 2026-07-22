<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Sales Transaction History</h1>
        <p class="text-sm text-slate-400">Complete log of POS customer sales & credit transaction records</p>
      </div>
      <NuxtLink to="/pos" class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition">
        🛒 Open POS Terminal
      </NuxtLink>
    </div>

    <!-- Sales Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading sales history...</p>
      </div>

      <div v-else-if="sales.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">📄</p>
        <p class="text-base font-semibold text-white">No sales transactions found</p>
        <p class="text-sm text-slate-500 mt-1">Open the POS terminal to complete your first sale transaction.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Invoice #</th>
              <th class="px-6 py-4">Customer</th>
              <th class="px-6 py-4">Seller</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Total Amount</th>
              <th class="px-6 py-4">Paid Amount</th>
              <th class="px-6 py-4">Remaining Debt</th>
              <th class="px-6 py-4">Payment Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="s in sales" :key="s.id" class="hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-mono font-bold text-emerald-400">{{ s.invoice_number }}</td>
              <td class="px-6 py-4 font-semibold text-white">{{ s.customer?.name || 'Walk-in Customer' }}</td>
              <td class="px-6 py-4 text-slate-400">{{ s.seller?.name }}</td>
              <td class="px-6 py-4 text-xs text-slate-400">{{ new Date(s.created_at).toLocaleString() }}</td>
              <td class="px-6 py-4 font-bold text-white">{{ s.total_amount }} ETB</td>
              <td class="px-6 py-4 text-emerald-400 font-semibold">{{ s.paid_amount }} ETB</td>
              <td class="px-6 py-4" :class="Number(s.remaining_amount) > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'">
                {{ s.remaining_amount }} ETB
              </td>
              <td class="px-6 py-4">
                <span 
                  class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': s.payment_status === 'PAID',
                    'bg-amber-500/10 text-amber-400 border-amber-500/20': s.payment_status === 'PARTIAL',
                    'bg-rose-500/10 text-rose-400 border-rose-500/20': s.payment_status === 'CREDIT'
                  }"
                >
                  {{ s.payment_status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Sale, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const { fetchApi } = useApi()
const sales = ref<Sale[]>([])
const isLoading = ref(false)

onMounted(async () => {
  isLoading.value = true
  try {
    const res = await fetchApi<ApiResponse<Sale[]>>('/sales')
    if (res.success) {
      sales.value = res.data
    }
  } catch (err) {
    console.error('Failed to load sales history', err)
  } finally {
    isLoading.value = false
  }
})
</script>
