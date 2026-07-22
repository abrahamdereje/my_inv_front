<template>
  <div class="max-w-4xl mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-white tracking-tight">Category Management</h1>
        <p class="text-sm text-slate-400">Organize materials into parent and child category trees</p>
      </div>
      <button 
        @click="showCreateModal = true"
        class="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition"
      >
        ➕ Create Category
      </button>
    </div>

    <!-- Category Tree Card -->
    <div class="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div v-if="productStore.categories.length === 0" class="text-center py-8 text-slate-500 text-sm">
        No categories available. Click "Create Category" to add your first category.
      </div>

      <div v-else class="space-y-4">
        <div 
          v-for="cat in productStore.categories" 
          :key="cat.id"
          class="border border-slate-800 rounded-xl p-4 bg-slate-950/60"
        >
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-3">
              <span class="text-lg">📂</span>
              <span class="font-bold text-white text-base">{{ cat.name }}</span>
            </div>
            <button @click="deleteCat(cat.id)" class="text-xs text-rose-400 hover:text-rose-300">Delete</button>
          </div>

          <!-- Children Categories List -->
          <div v-if="cat.children && cat.children.length > 0" class="mt-3 pl-8 space-y-2 border-l-2 border-indigo-500/20">
            <div 
              v-for="child in cat.children" 
              :key="child.id"
              class="flex items-center justify-between text-sm text-slate-300 bg-slate-900 px-3 py-2 rounded-lg border border-slate-800"
            >
              <div class="flex items-center space-x-2">
                <span>🏷️</span>
                <span>{{ child.name }}</span>
              </div>
              <button @click="deleteCat(child.id)" class="text-xs text-rose-400 hover:text-rose-300">Delete</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Category Modal -->
    <div v-if="showCreateModal" class="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between border-b border-slate-800 pb-3">
          <h3 class="font-bold text-white">Create New Category</h3>
          <button @click="showCreateModal = false" class="text-slate-400 hover:text-white">✕</button>
        </div>

        <form @submit.prevent="handleCreateCategory" class="space-y-4 text-sm">
          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Category Name *</label>
            <input v-model="catForm.name" type="text" required placeholder="e.g. Building Materials, Cement, Rebar" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-400 mb-1">Parent Category (Optional)</label>
            <select v-model="catForm.parent_category_id" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white">
              <option value="">None (Top-Level Category)</option>
              <option v-for="c in productStore.categories" :key="c.id" :value="c.id">{{ c.name }}</option>
            </select>
          </div>

          <div class="flex items-center justify-end space-x-3 pt-2">
            <button type="button" @click="showCreateModal = false" class="px-4 py-2 rounded-xl bg-slate-800 text-slate-300">Cancel</button>
            <button type="submit" class="px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold">Save Category</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useProductStore } from '~/stores/productStore'
import type { ApiResponse } from '~/types/models'

definePageMeta({
  middleware: 'auth'
})

const productStore = useProductStore()
const { fetchApi } = useApi()

const showCreateModal = ref(false)
const catForm = reactive({
  name: '',
  parent_category_id: ''
})

onMounted(() => {
  productStore.loadCategories()
})

const handleCreateCategory = async () => {
  try {
    const res = await fetchApi<ApiResponse<any>>('/categories', {
      method: 'POST',
      body: {
        name: catForm.name,
        parent_category_id: catForm.parent_category_id || null
      }
    })

    if (res.success) {
      showCreateModal.value = false
      catForm.name = ''
      catForm.parent_category_id = ''
      await productStore.loadCategories()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to create category')
  }
}

const deleteCat = async (id: string) => {
  if (!confirm('Are you sure you want to delete this category?')) return
  try {
    const res = await fetchApi<ApiResponse<any>>(`/categories/${id}`, {
      method: 'DELETE'
    })
    if (res.success) {
      await productStore.loadCategories()
    }
  } catch (err: any) {
    alert(err?.data?.message || 'Failed to delete category')
  }
}
</script>
