export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  roles: string[];
}

export interface Unit {
  id: string;
  name: string;
  symbol: string;
}

export interface ProductUnit {
  id: string;
  product_id: string;
  unit_id: string;
  conversion_rate: number;
  selling_price: number;
  is_default: boolean;
  unit?: Unit;
}

export interface Category {
  id: string;
  name: string;
  parent_category_id?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  base_unit_id: string;
  min_stock_alert: number;
  status: 'ACTIVE' | 'DISCONTINUED';
  base_unit?: Unit;
  categories?: Category[];
  product_units?: ProductUnit[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
