<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">FIFO Active Inventory Batches</h1>
        <p class="text-sm text-slate-400">Live active stock batches tracking cost price & remaining base quantities</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
        FIFO Costing Engine
      </span>
    </div>

    <!-- Active Batches Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="inventoryStore.isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading active stock batches...</p>
      </div>

      <div v-else-if="inventoryStore.activeBatches.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">🧊</p>
        <p class="text-base font-semibold text-white">No active stock batches found</p>
        <p class="text-sm text-slate-500 mt-1">Receive stock purchases to initialize FIFO inventory batches.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Batch ID</th>
              <th class="px-6 py-4">Product Name</th>
              <th class="px-6 py-4">Original Qty</th>
              <th class="px-6 py-4">Remaining Qty</th>
              <th class="px-6 py-4">Base Cost Price</th>
              <th class="px-6 py-4">Supplier</th>
              <th class="px-6 py-4">Received At</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="b in inventoryStore.activeBatches" :key="b.id" class="hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-mono text-xs text-indigo-400">{{ b.id.substring(0, 8) }}...</td>
              <td class="px-6 py-4 font-semibold text-white">
                {{ b.product?.name }}
                <span class="block text-xs font-mono text-slate-400">{{ b.product?.barcode || 'NO SKU' }}</span>
              </td>
              <td class="px-6 py-4 text-slate-400">{{ b.original_quantity }} {{ b.product?.base_unit?.symbol }}</td>
              <td class="px-6 py-4 font-bold text-emerald-400">
                {{ b.remaining_quantity }} {{ b.product?.base_unit?.symbol }}
              </td>
              <td class="px-6 py-4 font-bold text-white">{{ b.cost_price }} ETB / {{ b.product?.base_unit?.name }}</td>
              <td class="px-6 py-4 text-slate-300">
                {{ b.purchase_item?.purchase?.supplier?.name || 'Initial / Direct Entry' }}
              </td>
              <td class="px-6 py-4 text-xs text-slate-400">{{ new Date(b.created_at).toLocaleString() }}</td>
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
  inventoryStore.loadActiveBatches()
})
</script>
