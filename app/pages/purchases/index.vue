<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Purchases & Stock Invoices</h1>
        <p class="text-sm text-slate-400">Stock reception invoices from suppliers & batch inventory creation log</p>
      </div>
      <NuxtLink 
        to="/purchases/create"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
      >
        <span>➕ Record New Purchase</span>
      </NuxtLink>
    </div>

    <!-- Purchases Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="purchaseStore.isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading purchases...</p>
      </div>

      <div v-else-if="purchaseStore.purchases.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">📑</p>
        <p class="text-base font-semibold text-white">No purchase invoices recorded</p>
        <p class="text-sm text-slate-500 mt-1">Record a purchase invoice when receiving cement, steel, or materials into stock.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Invoice #</th>
              <th class="px-6 py-4">Supplier</th>
              <th class="px-6 py-4">Date</th>
              <th class="px-6 py-4">Total Amount</th>
              <th class="px-6 py-4">Paid Amount</th>
              <th class="px-6 py-4">Remaining Debt</th>
              <th class="px-6 py-4">Payment Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="p in purchaseStore.purchases" :key="p.id" class="hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-mono font-bold text-indigo-400">{{ p.invoice_number }}</td>
              <td class="px-6 py-4 font-semibold text-white">{{ p.supplier?.name || 'N/A' }}</td>
              <td class="px-6 py-4 text-slate-400">{{ p.purchase_date }}</td>
              <td class="px-6 py-4 font-bold text-white">{{ p.total_amount }} ETB</td>
              <td class="px-6 py-4 text-emerald-400 font-semibold">{{ p.paid_amount }} ETB</td>
              <td class="px-6 py-4" :class="Number(p.remaining_amount) > 0 ? 'text-rose-400 font-semibold' : 'text-slate-500'">
                {{ p.remaining_amount }} ETB
              </td>
              <td class="px-6 py-4">
                <span 
                  class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': p.payment_status === 'PAID',
                    'bg-amber-500/10 text-amber-400 border-amber-500/20': p.payment_status === 'PARTIAL',
                    'bg-rose-500/10 text-rose-400 border-rose-500/20': p.payment_status === 'CREDIT'
                  }"
                >
                  {{ p.payment_status }}
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
import { usePurchaseStore } from '~/stores/purchaseStore'

definePageMeta({
  middleware: 'auth'
})

const purchaseStore = usePurchaseStore()

onMounted(() => {
  purchaseStore.loadPurchases()
})
</script>
