import type { ApiResponse } from '~/types/models'

export interface SyncItem {
  entity_type: string;
  entity_id: string;
  operation: string;
  payload: any;
}

export const useSync = () => {
  const { fetchApi } = useApi()
  const isSyncing = ref(false)

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

  const registerDevice = async (deviceName: string = 'POS Tablet') => {
    try {
      const identifier = getDeviceIdentifier()
      await fetchApi<ApiResponse<any>>('/devices/register', {
        method: 'POST',
        body: {
          device_name: deviceName,
          device_identifier: identifier,
        }
      })
    } catch (err) {
      console.error('Device registration failed', err)
    }
  }

  const pushSyncQueue = async (items: SyncItem[]) => {
    if (items.length === 0) return

    isSyncing.value = true
    try {
      const identifier = getDeviceIdentifier()
      const res = await fetchApi<ApiResponse<any>>('/sync/push', {
        method: 'POST',
        body: {
          device_identifier: identifier,
          items,
        }
      })
      return res
    } catch (err) {
      console.error('Sync push failed', err)
    } finally {
      isSyncing.value = false
    }
  }

  return {
    isSyncing,
    getDeviceIdentifier,
    registerDevice,
    pushSyncQueue,
  }
}
