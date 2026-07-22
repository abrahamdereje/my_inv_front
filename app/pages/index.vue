<template>
  <div>
    <!-- Welcome Banner -->
    <div class="bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 rounded-3xl p-6 md:p-8 mb-8 shadow-xl">
      <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            System Online
          </span>
          <h1 class="text-2xl md:text-3xl font-bold text-white mt-2">
            Welcome back, {{ authStore.user?.name }} 👋
          </h1>
          <p class="text-sm text-slate-400 mt-1">
            Construction Materials Shop Management System (Remote Control Portal)
          </p>
        </div>

        <div class="flex items-center space-x-3">
          <NuxtLink 
            to="/products/create" 
            class="px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
          >
            <span>➕ Add Product</span>
          </NuxtLink>
          <NuxtLink 
            to="/pos" 
            class="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-lg shadow-emerald-600/30 transition flex items-center space-x-2"
          >
            <span>🛒 Open POS</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink to="/products" class="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition duration-200 shadow-lg">
        <div class="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200">
          📦
        </div>
        <h3 class="text-lg font-bold text-white group-hover:text-indigo-400 transition">Product Catalog</h3>
        <p class="text-sm text-slate-400 mt-1">Manage construction materials, multi-unit measurement conversions & prices.</p>
        <div class="mt-4 text-xs font-semibold text-indigo-400 flex items-center space-x-1">
          <span>Manage Catalog</span>
          <span>→</span>
        </div>
      </NuxtLink>

      <NuxtLink to="/categories" class="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-indigo-500/50 p-6 rounded-2xl transition duration-200 shadow-lg">
        <div class="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200">
          🏷️
        </div>
        <h3 class="text-lg font-bold text-white group-hover:text-violet-400 transition">Categories</h3>
        <p class="text-sm text-slate-400 mt-1">Organize Cement, Steel, Electrical Wires, Plumbing Pipes & Building Tools.</p>
        <div class="mt-4 text-xs font-semibold text-violet-400 flex items-center space-x-1">
          <span>Manage Categories</span>
          <span>→</span>
        </div>
      </NuxtLink>

      <NuxtLink to="/pos" class="group bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 p-6 rounded-2xl transition duration-200 shadow-lg">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition duration-200">
          🛒
        </div>
        <h3 class="text-lg font-bold text-white group-hover:text-emerald-400 transition">POS Checkout</h3>
        <p class="text-sm text-slate-400 mt-1">Mobile-first seller checkout with auto-unit conversions & fast search.</p>
        <div class="mt-4 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
          <span>Open POS</span>
          <span>→</span>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

definePageMeta({
  middleware: 'auth'
})

const authStore = useAuthStore()
</script>
