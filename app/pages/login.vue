<template>
  <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-indigo-500/10">
    <!-- Header -->
    <div class="text-center mb-8">
      <div class="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-indigo-500/30 mx-auto mb-4">
        CM
      </div>
      <h2 class="text-2xl font-bold text-white tracking-tight">Construction Materials Shop</h2>
      <p class="text-sm text-slate-400 mt-1">Sign in to your shop management portal</p>
    </div>

    <!-- Error Alert -->
    <div v-if="errorMessage" class="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-start space-x-3">
      <span>⚠️</span>
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Form -->
    <form @submit.prevent="handleLogin" class="space-y-5">
      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Phone Number or Email</label>
        <input 
          v-model="form.username" 
          type="text" 
          required 
          placeholder="0911000000 or owner@shop.com"
          class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      <div>
        <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password</label>
        <input 
          v-model="form.password" 
          type="password" 
          required 
          placeholder="••••••••"
          class="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
        />
      </div>

      <button 
        type="submit" 
        :disabled="isLoading"
        class="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold shadow-lg shadow-indigo-600/30 transition disabled:opacity-50 flex items-center justify-center space-x-2"
      >
        <span v-if="isLoading" class="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
        <span>{{ isLoading ? 'Signing in...' : 'Sign In' }}</span>
      </button>
    </form>

    <!-- Quick Demo Accounts -->
    <div class="mt-8 pt-6 border-t border-slate-800 text-center">
      <p class="text-xs text-slate-500 mb-3">Quick Demo Accounts</p>
      <div class="grid grid-cols-2 gap-2 text-xs">
        <button 
          @click="fillDemo('0911000000', '12345678')"
          class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition"
        >
          🔑 Owner Demo
        </button>
        <button 
          @click="fillDemo('0922000000', '12345678')"
          class="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700/50 transition"
        >
          🛒 Seller Demo
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/authStore'
import type { ApiResponse } from '~/types/models'

definePageMeta({
  layout: 'auth'
})

const authStore = useAuthStore()
const { fetchApi } = useApi()

const form = reactive({
  username: '',
  password: ''
})

const isLoading = ref(false)
const errorMessage = ref('')

const fillDemo = (user: string, pass: string) => {
  form.username = user
  form.password = pass
}

const handleLogin = async () => {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const res = await fetchApi<ApiResponse<{ token: string; user: any }>>('/auth/login', {
      method: 'POST',
      body: form
    })

    if (res.success && res.data) {
      authStore.setAuth(res.data.token, res.data.user)
      navigateTo('/')
    }
  } catch (err: any) {
    errorMessage.value = err?.data?.message || 'Invalid credentials or server error.'
  } finally {
    isLoading.value = false
  }
}
</script>
