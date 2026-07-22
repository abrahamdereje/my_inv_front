import Dexie, { type EntityTable } from 'dexie'
import type { Product } from '~/types/models'

export interface OfflineSaleItem {
  product_id: string;
  unit_id: string;
  quantity: number;
  selling_price: number;
}

export interface OfflineSale {
  id: string;
  customer_id: string | null;
  paid_amount: number;
  total_amount: number;
  items: OfflineSaleItem[];
  created_at: string;
  status: 'PENDING_SYNC' | 'SYNCED' | 'FAILED';
}

export interface SyncQueueItem {
  id?: number;
  entity_type: string;
  entity_id: string;
  operation: string;
  payload: any;
  created_at: string;
}

class ShopDatabase extends Dexie {
  products!: EntityTable<Product, 'id'>
  offlineSales!: EntityTable<OfflineSale, 'id'>
  syncQueue!: EntityTable<SyncQueueItem, 'id'>

  constructor() {
    super('ShopDatabase')
    this.version(1).stores({
      products: 'id, name, barcode',
      offlineSales: 'id, status, created_at',
      syncQueue: '++id, entity_type, entity_id, created_at'
    })
  }
}

export const db = new ShopDatabase()
