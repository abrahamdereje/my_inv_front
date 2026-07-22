<template>
  <div class="min-h-screen bg-slate-900 text-slate-100 flex flex-col md:flex-row">
    <!-- Mobile Header -->
    <header class="md:hidden bg-slate-950 border-b border-slate-800 p-4 flex items-center justify-between sticky top-0 z-40">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/30">
          CM
        </div>
        <span class="font-bold text-lg text-white">ShopManager</span>
      </div>
      <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
        </svg>
      </button>
    </header>

    <!-- Sidebar Navigation -->
    <aside 
      :class="[
        mobileMenuOpen ? 'block' : 'hidden',
        'md:block w-full md:w-64 bg-slate-950 border-r border-slate-800 flex-shrink-0 flex flex-col justify-between fixed md:sticky top-0 h-screen z-30 overflow-y-auto'
      ]"
    >
      <div>
        <!-- Brand -->
        <div class="p-6 hidden md:flex items-center space-x-3 border-b border-slate-800/80">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-indigo-500/20">
            CM
          </div>
          <div>
            <h1 class="font-bold text-lg text-white leading-tight">ShopManager</h1>
            <p class="text-xs text-indigo-400 font-medium">Construction Materials</p>
          </div>
        </div>

        <!-- Navigation Links -->
        <nav class="p-4 space-y-1">
          <NuxtLink 
            to="/" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📊</span> Dashboard
          </NuxtLink>

          <NuxtLink 
            v-if="authStore.hasRole('OWNER')"
            to="/reports" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/reports') ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📈</span> Owner Reports & Profits
          </NuxtLink>

          <NuxtLink 
            to="/products" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/products') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📦</span> Product Catalog
          </NuxtLink>

          <NuxtLink 
            to="/categories" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/categories' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">🏷️</span> Categories
          </NuxtLink>

          <div class="pt-3 pb-1">
            <span class="px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500">Purchasing & Inventory</span>
          </div>

          <NuxtLink 
            to="/suppliers" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/suppliers') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">🏢</span> Suppliers & Debt
          </NuxtLink>

          <NuxtLink 
            to="/purchases" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/purchases') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📑</span> Purchases / Invoices
          </NuxtLink>

          <NuxtLink 
            to="/inventory/batches" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/inventory/batches' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">🧊</span> FIFO Stock Batches
          </NuxtLink>

          <NuxtLink 
            to="/inventory/movements" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/inventory/movements' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📜</span> Stock Movements
          </NuxtLink>

          <NuxtLink 
            to="/inventory/counts" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/inventory/counts' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📋</span> Physical Stock Counts
          </NuxtLink>

          <div class="pt-3 pb-1">
            <span class="px-4 text-[10px] uppercase tracking-wider font-bold text-slate-500">Sales & Finance</span>
          </div>

          <NuxtLink 
            to="/pos" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/pos' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">🛒</span> POS Checkout
          </NuxtLink>

          <NuxtLink 
            to="/customers" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/customers') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">👥</span> Customers & Credit
          </NuxtLink>

          <NuxtLink 
            to="/sales" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path === '/sales' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">📄</span> Sales History
          </NuxtLink>

          <NuxtLink 
            to="/expenses" 
            @click="mobileMenuOpen = false"
            class="flex items-center px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-150"
            :class="route.path.startsWith('/expenses') ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'"
          >
            <span class="mr-3">💸</span> Operational Expenses
          </NuxtLink>
        </nav>
      </div>

      <!-- User Profile Card in Sidebar -->
      <div class="p-4 border-t border-slate-800/80 bg-slate-900/50">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3 overflow-hidden">
            <div class="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
              {{ authStore.user?.name?.charAt(0) || 'U' }}
            </div>
            <div class="truncate">
              <p class="text-sm font-semibold text-white truncate">{{ authStore.user?.name || 'Staff' }}</p>
              <span class="inline-block text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {{ authStore.user?.roles?.[0] || 'User' }}
              </span>
            </div>
          </div>
          <button 
            @click="handleLogout" 
            class="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            title="Logout"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>

    <!-- Main Content View -->
    <main class="flex-1 min-w-0 p-4 md:p-8 overflow-y-auto">
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()
const mobileMenuOpen = ref(false)

const handleLogout = () => {
  authStore.logout()
  navigateTo('/login')
}
</script>
