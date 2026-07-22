import { db, type OfflineSale, type SyncQueueItem } from '~/utils/db'
import type { Product, ApiResponse } from '~/types/models'

export const useSync = () => {
  const { fetchApi, initCsrf } = useApi()
  const isOnline = ref(true)
  const isSyncing = ref(false)
  const pendingCount = ref(0)

  const getDeviceIdentifier = () => {
    if (import.meta.client) {
      let id = localStorage.getItem('device_identifier')
      if (!id) {
        id = 'DEV-' + Math.random().toString(36).substring(2, 9).toUpperCase()
        localStorage.setItem('device_identifier', id)
      }
      return id
    }
    return 'DEV-SERVER'
  }

  const updateNetworkStatus = () => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
    }
  }

  const refreshPendingCount = async () => {
    if (import.meta.client) {
      pendingCount.value = await db.syncQueue.count()
    }
  }

  // Cache products to local IndexedDB
  const cacheProducts = async (products: Product[]) => {
    if (!import.meta.client) return
    try {
      await db.products.clear()
      await db.products.bulkAdd(products)
    } catch (err) {
      console.error('Failed to cache products to IndexedDB', err)
    }
  }

  // Get cached products from local IndexedDB
  const getCachedProducts = async (): Promise<Product[]> => {
    if (!import.meta.client) return []
    return await db.products.toArray()
  }

  // Record an offline sale transaction
  const recordOfflineSale = async (saleData: {
    customer_id: string | null;
    paid_amount: number;
    total_amount: number;
    items: any[];
  }) => {
    if (!import.meta.client) return

    const offlineId = 'OFFLINE-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)

    const saleRecord: OfflineSale = {
      id: offlineId,
      customer_id: saleData.customer_id,
      paid_amount: saleData.paid_amount,
      total_amount: saleData.total_amount,
      items: saleData.items,
      created_at: new Date().toISOString(),
      status: 'PENDING_SYNC'
    }

    await db.offlineSales.add(saleRecord)

    await db.syncQueue.add({
      entity_type: 'Sale',
      entity_id: offlineId,
      operation: 'CREATE',
      payload: {
        customer_id: saleData.customer_id,
        paid_amount: saleData.paid_amount,
        items: saleData.items
      },
      created_at: new Date().toISOString()
    })

    await refreshPendingCount()

    // Try auto-flushing queue if online
    if (isOnline.value) {
      await flushSyncQueue()
    }

    return saleRecord
  }

  // Flush sync queue to Laravel server
  const flushSyncQueue = async () => {
    if (!import.meta.client || isSyncing.value || !isOnline.value) return

    const queueItems = await db.syncQueue.toArray()
    if (queueItems.length === 0) return

    isSyncing.value = true
    try {
      await initCsrf()
      const identifier = getDeviceIdentifier()

      const res = await fetchApi<ApiResponse<any>>('/sync/push', {
        method: 'POST',
        body: {
          device_identifier: identifier,
          items: queueItems.map(q => ({
            entity_type: q.entity_type,
            entity_id: q.entity_id,
            operation: q.operation,
            payload: q.payload
          }))
        }
      })

      if (res.success && res.data) {
        // Clear processed queue items
        const processedIds = res.data.processed_ids || queueItems.map(q => q.entity_id)
        for (const item of queueItems) {
          if (processedIds.includes(item.entity_id)) {
            if (item.id) await db.syncQueue.delete(item.id)
            await db.offlineSales.where('id').equals(item.entity_id).modify({ status: 'SYNCED' })
          }
        }
      }
    } catch (err) {
      console.error('Failed to flush sync queue to server', err)
    } finally {
      isSyncing.value = false
      await refreshPendingCount()
    }
  }

  onMounted(() => {
    if (import.meta.client) {
      isOnline.value = navigator.onLine
      window.addEventListener('online', () => {
        isOnline.value = true
        flushSyncQueue()
      })
      window.addEventListener('offline', () => {
        isOnline.value = false
      })
      refreshPendingCount()
    }
  })

  return {
    isOnline,
    isSyncing,
    pendingCount,
    getDeviceIdentifier,
    cacheProducts,
    getCachedProducts,
    recordOfflineSale,
    flushSyncQueue,
  }
}
