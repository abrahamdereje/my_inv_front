<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Operational Expense Tracker</h1>
        <p class="text-sm text-slate-400">Track rent, transport, employee salaries, electricity, and shop maintenance</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition flex items-center space-x-2"
      >
        <span>💸 Record Expense</span>
      </button>
    </div>

    <!-- Expense Table Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
      <div v-if="isLoading" class="p-12 text-center text-slate-400">
        <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p class="text-sm">Loading expenses...</p>
      </div>

      <div v-else-if="expenses.length === 0" class="p-12 text-center text-slate-400">
        <p class="text-3xl mb-2">💸</p>
        <p class="text-base font-semibold text-white">No expenses recorded</p>
        <p class="text-sm text-slate-500 mt-1">Record shop expenses to automatically calculate net profit.</p>
      </div>

      <div v-else class="overflow-x-auto">
        <table class="w-full text-left text-sm text-slate-300">
          <thead class="bg-slate-950 text-xs font-semibold uppercase text-slate-400 border-b border-slate-800">
            <tr>
              <th class="px-6 py-4">Expense Title</th>
              <th class="px-6 py-4">Category</th>
              <th class="px-6 py-4">Amount</th>
              <th class="px-6 py-4">Recorded By</th>
              <th class="px-6 py-4">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-800">
            <tr v-for="e in expenses" :key="e.id" class="hover:bg-slate-800/50 transition">
              <td class="px-6 py-4 font-semibold text-white">
                {{ e.title }}
                <p v-if="e.description" class="text-xs text-slate-400 font-normal">{{ e.description }}</p>
              </td>
              <td class="px-6 py-4">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700">
                  {{ e.category }}
                </span>
              </td>
              <td class="px-6 py-4 font-bold text-rose-400">{{ e.amount }} ETB</td>
              <td class="px-6 py-4 text-slate-400">{{ e.creator?.name || 'Staff' }}</td>
              <td class="px-6 py-4 text-xs text-slate-400">{{ new Date(e.created_at).toLocaleString() }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Record Expense Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Record Operational Expense</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateExpense" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Expense Title *</label>
            <input v-model="form.title" type="text" required placeholder="e.g. Shop Rent July, Transport for Cement" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Expense Category *</label>
            <select v-model="form.category" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="RENT">Rent</option>
              <option value="TRANSPORT">Transport & Loading</option>
              <option value="SALARY">Employee Salary</option>
              <option value="UTILITIES">Electricity & Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="GENERAL">General Expense</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Amount (ETB) *</label>
            <input v-model.number="form.amount" type="number" step="0.01" min="0.01" required placeholder="0.00" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Description / Notes</label>
            <textarea v-model="form.description" rows="2" placeholder="Details..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Save Expense</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Expense, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const { fetchApi } = useApi()
const expenses = ref<Expense[]>([])
const isLoading = ref(false)
const showCreateModal = ref(false)

const form = reactive({
  title: '',
  category: 'GENERAL',
  amount: 0,
  description: ''
})

const loadExpenses = async () => {
  isLoading.value = true
  try {
    const res = await fetchApi<ApiResponse<Expense[]>>('/expenses')
    if (res.success) {
      expenses.value = res.data
    }
  } catch (err) {
    console.error('Failed to load expenses', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadExpenses()
})

const handleCreateExpense = async () => {
  try {
    const res = await fetchApi<ApiResponse<any>>('/expenses', {
      method: 'POST',
      body: form
    })

    if (res.success) {
      showCreateModal.value = false
      form.title = ''
      form.category = 'GENERAL'
      form.amount = 0
      form.description = ''
      await loadExpenses()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to record expense')
  }
}
</script>
