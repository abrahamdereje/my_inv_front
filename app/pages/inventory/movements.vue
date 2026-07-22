<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Stock Movement Audit Trail</h1>
        <p class="text-sm text-slate-400">Immutable ledger of every inventory increment and decrement</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        Audit Log
      </span>
    </div>

    <!-- Stock Movements Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="inventoryStore.isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading stock movement logs...</p>
      </div>

      <div v-else-if="inventoryStore.movements.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">📜</p>
        <p class="text-base font-semibold text-white">No stock movements recorded</p>
        <p class="text-sm text-slate-500 mt-1">Stock movements are automatically recorded during purchases, sales, and stock counts.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Timestamp</th>
              <th class="px-6 py-4">Product</th>
              <th class="px-6 py-4">Movement Type</th>
              <th class="px-6 py-4">Quantity (Base)</th>
              <th class="px-6 py-4">Reference</th>
              <th class="px-6 py-4">Performed By</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="m in inventoryStore.movements" :key="m.id" class="hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 text-xs text-slate-400">{{ new Date(m.created_at).toLocaleString() }}</td>
              <td class="px-6 py-4 font-semibold text-white">{{ m.product?.name }}</td>
              <td class="px-6 py-4">
                <span 
                  class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border"
                  :class="{
                    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20': m.movement_type === 'PURCHASE',
                    'bg-indigo-500/10 text-indigo-400 border-indigo-500/20': m.movement_type === 'SALE',
                    'bg-rose-500/10 text-rose-400 border-rose-500/20': m.movement_type === 'DAMAGE',
                    'bg-amber-500/10 text-amber-400 border-amber-500/20': m.movement_type === 'ADJUSTMENT'
                  }"
                >
                  {{ m.movement_type }}
                </span>
              </td>
              <td 
                class="px-6 py-4 font-bold"
                :class="Number(m.quantity) >= 0 ? 'text-emerald-400' : 'text-rose-400'"
              >
                {{ Number(m.quantity) >= 0 ? '+' : '' }}{{ m.quantity }} {{ m.product?.base_unit?.symbol }}
              </td>
              <td class="px-6 py-4 font-mono text-xs text-slate-400">{{ m.reference_type }}</td>
              <td class="px-6 py-4 text-slate-300">{{ m.creator?.name || 'System' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useInventoryStore } from '~/stores/inventoryStore'

definePageMeta({
  middleware: 'auth'
})

const inventoryStore = useInventoryStore()

onMounted(() => {
  inventoryStore.loadMovements()
})
</script>
