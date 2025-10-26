export interface DashboardStats {
  stats: {
    totalUsers: number;
    totalProducts: number;
    totalOrders: number;
    totalRevenue: number | string;
  };
  recentOrders: Order[];
  lowStockProducts: Product[];
}

export interface Order {
  id: number;
  user_name: string;
  total_amount: number | string;
  status: OrderStatus;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  stock_quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';