<template>
  <div class="h-[calc(100vh-5rem)] flex flex-col lg:flex-row gap-6">
    <!-- Left Area: Product Search & Unit Selection Grid -->
    <div class="flex-1 flex flex-col min-h-0 space-y-4">
      <!-- Search & Filters -->
      <div class="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-lg">
        <span class="text-slate-500 pl-1">🔍</span>
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Search materials (e.g. Cement, Wire, Nail, NL-3INCH)..."
          class="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
        />
        <button v-if="searchQuery" @click="searchQuery = ''" class="text-xs text-slate-500 hover:text-white">Clear</button>
      </div>

      <!-- Products Grid -->
      <div class="flex-1 overflow-y-auto pr-1">
        <div v-if="posStore.isLoading" class="p-12 text-center text-slate-400">
          <div class="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p class="text-sm">Loading POS catalog...</p>
        </div>

        <div v-else-if="filteredProducts.length === 0" class="p-12 text-center text-slate-500 bg-slate-900/60 rounded-2xl border border-slate-800">
          No materials match your search query.
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          <div 
            v-for="p in filteredProducts" 
            :key="p.id"
            class="bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-4 flex flex-col justify-between space-y-3 transition shadow-lg"
          >
            <div>
              <div class="flex items-center justify-between">
                <span class="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  {{ p.barcode || 'NO SKU' }}
                </span>
                <span 
                  class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                  :class="(p.available_stock || 0) > 0 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'"
                >
                  Stock: {{ p.available_stock || 0 }} {{ p.base_unit?.symbol }}
                </span>
              </div>

              <h3 class="font-bold text-white text-base mt-2 leading-tight">{{ p.name }}</h3>
            </div>

            <!-- Available Selling Units Buttons -->
            <div class="space-y-1.5 pt-2 border-t border-slate-800/80">
              <span class="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Select Unit & Add to Cart</span>
              <div class="grid grid-cols-1 gap-1.5">
                <button 
                  v-for="pu in p.product_units" 
                  :key="pu.id"
                  @click="posStore.addToCart(p, pu, 1)"
                  :disabled="(p.available_stock || 0) <= 0"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 hover:bg-indigo-600/30 hover:border-indigo-500 border border-slate-800 flex items-center justify-between text-xs transition disabled:opacity-40 disabled:cursor-not-allowed group"
                >
                  <span class="font-bold text-white group-hover:text-indigo-200">
                    {{ pu.unit?.name }}
                    <span class="text-[10px] text-slate-500 font-normal">({{ pu.conversion_rate }} {{ p.base_unit?.symbol }})</span>
                  </span>
                  <span class="font-extrabold text-emerald-400">{{ pu.selling_price }} ETB</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Area: Cart Manager & Checkout Panel -->
    <div class="w-full lg:w-96 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between shadow-2xl p-5 overflow-y-auto">
      <div>
        <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🛒</span>
            <h2 class="font-bold text-white text-base">Active Sales Cart</h2>
          </div>
          <button v-if="posStore.cart.length > 0" @click="posStore.clearCart()" class="text-xs text-rose-400 hover:underline">Clear</button>
        </div>

        <!-- Cart Items List -->
        <div v-if="posStore.cart.length === 0" class="p-8 text-center text-slate-500 text-xs space-y-2">
          <p class="text-2xl">🛒</p>
          <p>Cart is empty.</p>
          <p class="text-[11px] text-slate-600">Click a material unit button on the left to add items.</p>
        </div>

        <div v-else class="space-y-3 max-h-80 overflow-y-auto pr-1">
          <div 
            v-for="(item, idx) in posStore.cart" 
            :key="idx"
            class="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2"
          >
            <div class="flex items-start justify-between">
              <div>
                <h4 class="font-bold text-white text-xs leading-tight">{{ item.product.name }}</h4>
                <span class="text-[11px] font-semibold text-indigo-400">Unit: {{ item.unit.unit?.name }}</span>
              </div>
              <button @click="posStore.removeFromCart(idx)" class="text-slate-500 hover:text-rose-400 text-xs">✕</button>
            </div>

            <div class="flex items-center justify-between pt-1 border-t border-slate-800/60">
              <!-- Qty Buttons -->
              <div class="flex items-center space-x-2 bg-slate-950 rounded-lg p-1 border border-slate-800">
                <button @click="posStore.updateQuantity(idx, item.quantity - 1)" class="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs">-</button>
                <span class="w-8 text-center text-xs font-bold text-white">{{ item.quantity }}</span>
                <button @click="posStore.updateQuantity(idx, item.quantity + 1)" class="w-6 h-6 rounded bg-slate-800 text-white font-bold text-xs">+</button>
              </div>

              <div class="text-right">
                <span class="block text-[10px] text-slate-500">@ {{ item.selling_price }} ETB</span>
                <span class="font-bold text-emerald-400 text-xs">{{ (item.quantity * item.selling_price).toFixed(2) }} ETB</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cart Summary & Checkout Form -->
      <div v-if="posStore.cart.length > 0" class="pt-4 border-t border-slate-800 space-y-4">
        <!-- Customer Selection -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Customer (Walk-in vs Credit)</label>
          <select v-model="posStore.selectedCustomerId" class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs">
            <option :value="null">Walk-in Customer (Full Cash)</option>
            <option v-for="c in customerStore.customers" :key="c.id" :value="c.id">
              {{ c.name }} (Limit: {{ c.credit_limit }} ETB)
            </option>
          </select>
        </div>

        <!-- Paid Amount Input -->
        <div>
          <label class="block text-xs font-semibold text-slate-400 mb-1">Paid Amount (ETB)</label>
          <input 
            v-model.number="posStore.paidAmount" 
            type="number" 
            step="0.01" 
            min="0" 
            placeholder="Enter amount paid" 
            class="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-emerald-400 font-bold text-sm"
          />
        </div>

        <!-- Totals & Change / Credit Display -->
        <div class="p-3 bg-slate-900 rounded-xl border border-slate-800 space-y-1.5 text-xs">
          <div class="flex justify-between font-bold text-white text-sm">
            <span>Total Payable:</span>
            <span>{{ posStore.cartTotal.toFixed(2) }} ETB</span>
          </div>

          <div v-if="posStore.paidAmount > posStore.cartTotal" class="flex justify-between text-emerald-400 font-semibold">
            <span>Cash Change:</span>
            <span>{{ (posStore.paidAmount - posStore.cartTotal).toFixed(2) }} ETB</span>
          </div>

          <div v-else-if="posStore.cartTotal > posStore.paidAmount" class="flex justify-between text-rose-400 font-semibold">
            <span>Unpaid Credit Debt:</span>
            <span>{{ (posStore.cartTotal - posStore.paidAmount).toFixed(2) }} ETB</span>
          </div>
        </div>

        <!-- Checkout Button -->
        <button 
          @click="submitCheckout"
          :disabled="isSubmitting"
          class="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition disabled:opacity-50"
        >
          {{ isSubmitting ? 'Processing Checkout...' : 'Complete POS Checkout' }}
        </button>
      </div>
    </div>

    <!-- Printable Receipt Modal -->
    <div v-if="lastReceipt" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl space-y-4">
        <div class="text-center border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white text-lg">Sales Receipt</h3>
          <p class="text-xs text-indigo-400 font-mono">{{ lastReceipt.invoice_number }}</p>
          <p class="text-[11px] text-slate-500 mt-1">{{ new Date(lastReceipt.created_at).toLocaleString() }}</p>
        </div>

        <div class="space-y-2 max-h-48 overflow-y-auto text-xs">
          <div v-for="item in lastReceipt.items" :key="item.id" class="flex justify-between border-b border-slate-800/60 pb-1">
            <div>
              <p class="font-semibold text-white">{{ item.product?.name }}</p>
              <p class="text-slate-500 text-[10px]">{{ item.quantity }} x {{ item.selling_price }} ETB</p>
            </div>
            <p class="font-bold text-emerald-400">{{ (item.quantity * item.selling_price).toFixed(2) }} ETB</p>
          </div>
        </div>

        <div class="pt-2 border-t border-slate-800 text-xs space-y-1">
          <div class="flex justify-between font-bold text-white text-sm">
            <span>Total Amount:</span>
            <span>{{ lastReceipt.total_amount }} ETB</span>
          </div>
          <div class="flex justify-between text-slate-400">
            <span>Paid Amount:</span>
            <span>{{ lastReceipt.paid_amount }} ETB</span>
          </div>
          <div v-if="Number(lastReceipt.remaining_amount) > 0" class="flex justify-between text-rose-400 font-semibold">
            <span>Credit Remaining:</span>
            <span>{{ lastReceipt.remaining_amount }} ETB</span>
          </div>
        </div>

        <div class="pt-3">
          <button @click="lastReceipt = null" class="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs">
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { usePosStore } from '~/stores/posStore'
import { useCustomerStore } from '~/stores/customerStore'
import type { Sale, ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const posStore = usePosStore()
const customerStore = useCustomerStore()
const { fetchApi } = useApi()

const searchQuery = ref('')
const isSubmitting = ref(false)
const lastReceipt = ref<Sale | null>(null)

onMounted(async () => {
  await Promise.all([
    posStore.loadPosProducts(),
    customerStore.loadCustomers()
  ])
})

const filteredProducts = computed(() => {
  if (!searchQuery.value) return posStore.posProducts
  const q = searchQuery.value.toLowerCase()
  return posStore.posProducts.filter(p => 
    p.name.toLowerCase().includes(q) || (p.barcode && p.barcode.toLowerCase().includes(q))
  )
})

const submitCheckout = async () => {
  if (posStore.cart.length === 0) return

  // Auto set paid amount if not typed
  if (posStore.paidAmount === 0 && !posStore.selectedCustomerId) {
    posStore.paidAmount = posStore.cartTotal
  }

  isSubmitting.value = true

  try {
    const payload = {
      customer_id: posStore.selectedCustomerId,
      paid_amount: posStore.paidAmount,
      items: posStore.cart.map(i => ({
        product_id: i.product.id,
        unit_id: i.unit.unit_id,
        quantity: i.quantity,
        selling_price: i.selling_price
      }))
    }

    const res = await fetchApi<ApiResponse<Sale>>('/sales', {
      method: 'POST',
      body: payload
    })

    if (res.success && res.data) {
      lastReceipt.value = res.data
      posStore.clearCart()
      await posStore.loadPosProducts()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to complete POS checkout')
  } finally {
    isSubmitting.value = false
  }
}
</script>
