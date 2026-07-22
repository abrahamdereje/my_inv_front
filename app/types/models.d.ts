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
  available_stock?: number;
  current_stock?: number;
}

export interface Supplier {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  current_debt: number;
  created_at?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  address?: string;
  credit_limit: number;
  current_debt: number;
  created_at?: string;
}

export interface Expense {
  id: string;
  title: string;
  category: string;
  amount: number;
  description?: string;
  created_at: string;
  creator?: User;
}

export interface ExecutiveSummaryReport {
  total_sales_revenue: number;
  cash_sales: number;
  credit_sales: number;
  total_expenses: number;
  gross_profit: number;
  net_profit: number;
  total_customer_debts: number;
  total_supplier_debts: number;
  inventory_valuation: number;
  top_selling_products: any[];
  low_stock_products: Product[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}
