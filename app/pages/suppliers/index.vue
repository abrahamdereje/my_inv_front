<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Suppliers & Credit Debt Ledger</h1>
        <p class="text-sm text-slate-400">Track material suppliers, purchase history & outstanding credit debt</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
      >
        ➕ Register Supplier
      </button>
    </div>

    <!-- Supplier Grid Cards -->
    <div v-if="supplierStore.isLoading" class="p-12 text-center text-slate-400">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-sm">Loading suppliers...</p>
    </div>

    <div v-else-if="supplierStore.suppliers.length === 0" class="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
      <p class="text-3xl mb-2">🏢</p>
      <p class="text-base font-semibold text-white">No suppliers registered</p>
      <p class="text-sm text-slate-500 mt-1">Register suppliers to start receiving stock purchases on cash or credit.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="supplier in supplierStore.suppliers" 
        :key="supplier.id"
        class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-1 rounded-lg">
              SUPPLIER
            </span>
            <span 
              class="text-xs font-bold px-2.5 py-1 rounded-lg border"
              :class="Number(supplier.current_debt) > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
            >
              Debt: {{ supplier.current_debt }} ETB
            </span>
          </div>

          <h3 class="text-lg font-bold text-white mt-1">{{ supplier.name }}</h3>
          <p class="text-xs text-slate-400 mt-1">📞 {{ supplier.phone || 'No phone' }}</p>
          <p class="text-xs text-slate-400 mt-0.5">📍 {{ supplier.address || 'No address' }}</p>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
          <button 
            v-if="Number(supplier.current_debt) > 0"
            @click="openPaymentModal(supplier)"
            class="w-full py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold text-xs transition"
          >
            💵 Record Credit Payment
          </button>
          <span v-else class="text-xs text-slate-500 italic">No debt balance</span>
        </div>
      </div>
    </div>

    <!-- Register Supplier Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Register Supplier</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateSupplier" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Supplier / Factory Name *</label>
            <input v-model="form.name" type="text" required placeholder="e.g. ABC Cement Factory, National Steel" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="0911..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Address / Location</label>
            <textarea v-model="form.address" rows="2" placeholder="Factory address..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Save Supplier</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Record Debt Payment Modal -->
    <div v-if="activePaymentSupplier" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Record Payment to {{ activePaymentSupplier.name }}</h3>
          <button @click="activePaymentSupplier = null" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
          <span class="text-slate-400">Current Outstanding Debt:</span>
          <span class="font-bold text-rose-400">{{ activePaymentSupplier.current_debt }} ETB</span>
        </div>

        <form @submit.prevent="handleRecordPayment" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Payment Amount (ETB) *</label>
            <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0.01" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Payment Method *</label>
            <select v-model="paymentForm.payment_method" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="BANK_TRANSFER">Bank Transfer / Telebirr</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Transaction Reference</label>
            <input v-model="paymentForm.reference" type="text" placeholder="Bank ref / Cheque number..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="activePaymentSupplier = null" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">Post Payment</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupplierStore } from '~/stores/supplierStore'
import type { Supplier, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const supplierStore = useSupplierStore()
const { fetchApi } = useApi()

const showCreateModal = ref(false)
const activePaymentSupplier = ref<Supplier | null>(null)

const form = reactive({
  name: '',
  phone: '',
  address: ''
})

const paymentForm = reactive({
  amount: 0,
  payment_method: 'BANK_TRANSFER',
  reference: ''
})

onMounted(() => {
  supplierStore.loadSuppliers()
})

const handleCreateSupplier = async () => {
  try {
    const res = await fetchApi<ApiResponse<any>>('/suppliers', {
      method: 'POST',
      body: form
    })

    if (res.success) {
      showCreateModal.value = false
      form.name = ''
      form.phone = ''
      form.address = ''
      await supplierStore.loadSuppliers()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to register supplier')
  }
}

const openPaymentModal = (supplier: Supplier) => {
  activePaymentSupplier.value = supplier
  paymentForm.amount = supplier.current_debt
  paymentForm.payment_method = 'BANK_TRANSFER'
  paymentForm.reference = ''
}

const handleRecordPayment = async () => {
  if (!activePaymentSupplier.value) return

  try {
    const res = await fetchApi<ApiResponse<any>>(`/suppliers/${activePaymentSupplier.value.id}/payments`, {
      method: 'POST',
      body: paymentForm
    })

    if (res.success) {
      activePaymentSupplier.value = null
      await supplierStore.loadSuppliers()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to record supplier payment')
  }
}
</script>
