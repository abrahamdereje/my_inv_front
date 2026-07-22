<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">POS Checkout</h1>
        <p class="text-sm text-slate-400">Mobile-first seller point of sale interface</p>
      </div>
      <span class="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
        POS Active
      </span>
    </div>

    <!-- Stub card for Phase 1 -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-4 shadow-xl">
      <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-3xl mx-auto">
        🛒
      </div>
      <h3 class="text-xl font-bold text-white">POS Terminal Initialized</h3>
      <p class="text-sm text-slate-400 max-w-md mx-auto">
        Products catalog & unit conversions are configured. Full FIFO inventory batching, cart checkout, and customer credit ledger integration will take place in Phase 2 & Phase 3.
      </p>
      <NuxtLink to="/products" class="inline-block px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition">
        View Product Catalog
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({
  middleware: 'auth'
})
</script>
