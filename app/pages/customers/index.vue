<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Customer Directory & Credit Ledger</h1>
        <p class="text-sm text-slate-400">Manage construction client profiles, credit limits & debt repayments</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
      >
        ➕ Register Customer
      </button>
    </div>

    <!-- Customer Cards Grid -->
    <div v-if="customerStore.isLoading" class="p-12 text-center text-slate-400">
      <div class="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
      <p class="text-sm">Loading customer directory...</p>
    </div>

    <div v-else-if="customerStore.customers.length === 0" class="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
      <p class="text-3xl mb-2">👥</p>
      <p class="text-base font-semibold text-white">No customers registered</p>
      <p class="text-sm text-slate-500 mt-1">Register customers to enable partial & credit sale transactions on POS.</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="c in customerStore.customers" 
        :key="c.id"
        class="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between shadow-xl"
      >
        <div>
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-semibold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
              Limit: {{ c.credit_limit }} ETB
            </span>
            <span 
              class="text-xs font-bold px-2.5 py-1 rounded-lg border"
              :class="Number(c.current_debt) > 0 ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'"
            >
              Debt: {{ c.current_debt }} ETB
            </span>
          </div>

          <h3 class="text-lg font-bold text-white mt-1">{{ c.name }}</h3>
          <p class="text-xs text-slate-400 mt-1">📞 {{ c.phone || 'No phone' }}</p>
          <p class="text-xs text-slate-400 mt-0.5">📍 {{ c.address || 'No address' }}</p>
        </div>

        <div class="pt-4 mt-4 border-t border-slate-800 flex items-center justify-between">
          <button 
            v-if="Number(c.current_debt) > 0"
            @click="openPaymentModal(c)"
            class="w-full py-2 rounded-xl bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-semibold text-xs transition"
          >
            💵 Collect Debt Payment
          </button>
          <span v-else class="text-xs text-slate-500 italic">No debt balance</span>
        </div>
      </div>
    </div>

    <!-- Register Customer Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Register Customer</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateCustomer" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Customer / Contractor Name *</label>
            <input v-model="form.name" type="text" required placeholder="e.g. Abebe Construction, Kebede Contractor" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Phone Number</label>
            <input v-model="form.phone" type="text" placeholder="0911..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Credit Limit (ETB)</label>
            <input v-model.number="form.credit_limit" type="number" step="0.01" min="0" placeholder="Maximum allowed credit debt" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Address / Site Location</label>
            <textarea v-model="form.address" rows="2" placeholder="Site location..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white"></textarea>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Save Customer</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Collect Debt Payment Modal -->
    <div v-if="activePaymentCustomer" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Collect Payment from {{ activePaymentCustomer.name }}</h3>
          <button @click="activePaymentCustomer = null" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <div class="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs flex justify-between">
          <span class="text-slate-400">Current Outstanding Debt:</span>
          <span class="font-bold text-rose-400">{{ activePaymentCustomer.current_debt }} ETB</span>
        </div>

        <form @submit.prevent="handleRecordPayment" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Payment Amount (ETB) *</label>
            <input v-model.number="paymentForm.amount" type="number" step="0.01" min="0.01" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Payment Method *</label>
            <select v-model="paymentForm.payment_method" required class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="CASH">Cash</option>
              <option value="MOBILE_MONEY">Telebirr / Mobile Money</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Transaction Reference</label>
            <input v-model="paymentForm.reference" type="text" placeholder="Transaction ID / Cheque #..." class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="activePaymentCustomer = null" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold">Record Payment</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useCustomerStore } from '~/stores/customerStore'
import type { Customer, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const customerStore = useCustomerStore()
const { fetchApi } = useApi()

const showCreateModal = ref(false)
const activePaymentCustomer = ref<Customer | null>(null)

const form = reactive({
  name: '',
  phone: '',
  address: '',
  credit_limit: 0
})

const paymentForm = reactive({
  amount: 0,
  payment_method: 'CASH',
  reference: ''
})

onMounted(() => {
  customerStore.loadCustomers()
})

const handleCreateCustomer = async () => {
  try {
    const res = await fetchApi<ApiResponse<any>>('/customers', {
      method: 'POST',
      body: form
    })

    if (res.success) {
      showCreateModal.value = false
      form.name = ''
      form.phone = ''
      form.address = ''
      form.credit_limit = 0
      await customerStore.loadCustomers()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to register customer')
  }
}

const openPaymentModal = (customer: Customer) => {
  activePaymentCustomer.value = customer
  paymentForm.amount = customer.current_debt
  paymentForm.payment_method = 'CASH'
  paymentForm.reference = ''
}

const handleRecordPayment = async () => {
  if (!activePaymentCustomer.value) return

  try {
    const res = await fetchApi<ApiResponse<any>>(`/customers/${activePaymentCustomer.value.id}/payments`, {
      method: 'POST',
      body: paymentForm
    })

    if (res.success) {
      activePaymentCustomer.value = null
      await customerStore.loadCustomers()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to record customer debt payment')
  }
}
</script>
