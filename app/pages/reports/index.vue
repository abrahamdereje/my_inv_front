<template>
  <div class="space-y-8">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div class="flex items-center space-x-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
            Owner Access Only
          </span>
        </div>
        <h1 class="text-2xl font-bold text-white tracking-tight mt-1">Executive Financial Reports & Net Profit</h1>
        <p class="text-sm text-slate-400">Remote business oversight, FIFO net margin analysis & financial health metrics</p>
      </div>

      <button @click="loadReport" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold">
        🔄 Refresh Metrics
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="p-12 text-center text-slate-400">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-sm">Calculating executive metrics and Net Profit...</p>
    </div>

    <!-- Financial Summary Metric Cards Grid -->
    <div v-else-if="summary" class="space-y-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <!-- Total Revenue -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Sales Revenue</span>
          <div class="text-2xl font-black text-white mt-2">{{ summary.total_sales_revenue.toFixed(2) }} ETB</div>
          <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
            <span>Cash: {{ summary.cash_sales.toFixed(2) }}</span>
            <span class="text-amber-400">Credit: {{ summary.credit_sales.toFixed(2) }}</span>
          </div>
        </div>

        <!-- Gross Profit -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">FIFO Gross Profit</span>
          <div class="text-2xl font-black text-emerald-400 mt-2">{{ summary.gross_profit.toFixed(2) }} ETB</div>
          <p class="text-[11px] text-slate-500 mt-2">Calculated from batch cost prices</p>
        </div>

        <!-- Operational Expenses -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Expenses</span>
          <div class="text-2xl font-black text-rose-400 mt-2">{{ summary.total_expenses.toFixed(2) }} ETB</div>
          <p class="text-[11px] text-slate-500 mt-2">Rent, salaries, transport & maintenance</p>
        </div>

        <!-- Net Profit Card ⭐ -->
        <div 
          class="p-5 rounded-2xl shadow-xl border"
          :class="summary.net_profit >= 0 ? 'bg-gradient-to-tr from-emerald-950/60 to-slate-900 border-emerald-500/40' : 'bg-gradient-to-tr from-rose-950/60 to-slate-900 border-rose-500/40'"
        >
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-300">Net Profit</span>
            <span 
              class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
              :class="summary.net_profit >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'"
            >
              {{ summary.net_profit >= 0 ? 'PROFITABLE' : 'NET LOSS' }}
            </span>
          </div>
          <div 
            class="text-3xl font-black mt-2"
            :class="summary.net_profit >= 0 ? 'text-emerald-300' : 'text-rose-400'"
          >
            {{ summary.net_profit.toFixed(2) }} ETB
          </div>
          <p class="text-[11px] text-slate-400 mt-2">Gross Profit − Total Expenses</p>
        </div>
      </div>

      <!-- Second Row Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <!-- Inventory Valuation -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Warehouse Inventory Value</span>
          <div class="text-xl font-bold text-indigo-400 mt-2">{{ summary.inventory_valuation.toFixed(2) }} ETB</div>
          <p class="text-[11px] text-slate-500 mt-1">Total value of unconsumed stock batches</p>
        </div>

        <!-- Customer Debts -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Customer Debts</span>
          <div class="text-xl font-bold text-amber-400 mt-2">{{ summary.total_customer_debts.toFixed(2) }} ETB</div>
          <p class="text-[11px] text-slate-500 mt-1">Money owed to shop by clients</p>
        </div>

        <!-- Supplier Debts -->
        <div class="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-xl">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Outstanding Supplier Debts</span>
          <div class="text-xl font-bold text-rose-400 mt-2">{{ summary.total_supplier_debts.toFixed(2) }} ETB</div>
          <p class="text-[11px] text-slate-500 mt-1">Money owed by shop to suppliers</p>
        </div>
      </div>

      <!-- Low Stock Alerts Warning Section -->
      <div v-if="summary.low_stock_products.length > 0" class="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-6">
        <div class="flex items-center space-x-2 mb-3">
          <span class="text-xl">⚠️</span>
          <h3 class="font-bold text-amber-300 text-base">Low Stock Alert (Stock Below Minimum Level)</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div 
            v-for="item in summary.low_stock_products" 
            :key="item.id"
            class="bg-slate-900/90 border border-amber-500/20 p-3.5 rounded-xl flex items-center justify-between text-xs"
          >
            <div>
              <p class="font-bold text-white">{{ item.name }}</p>
              <p class="text-slate-400">Min Alert Threshold: {{ item.min_stock_alert }} {{ item.base_unit?.symbol }}</p>
            </div>
            <div class="text-right font-extrabold text-amber-400 text-sm">
              {{ item.current_stock || 0 }} {{ item.base_unit?.symbol }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import type { ExecutiveSummaryReport, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
const { fetchApi } = useApi()

const summary = ref<ExecutiveSummaryReport | null>(null)
const isLoading = ref(false)

const loadReport = async () => {
  if (!authStore.hasRole('OWNER')) return

  isLoading.value = true
  try {
    const res = await fetchApi<ApiResponse<ExecutiveSummaryReport>>('/reports/summary')
    if (res.success) {
      summary.value = res.data
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to load executive summary report')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadReport()
})
</script>
