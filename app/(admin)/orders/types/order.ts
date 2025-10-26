export interface Order {
  id: number;
  user_id: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shipping_address: string;
  payment_method: string;
  created_at: string;
  updated_at?: string;
  user_name: string;
  user_email: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  quantity: number;
  price: number;
  name: string;
  image: string;
  brand?: string;
}

export interface UpdateOrderStatusData {
  status: Order['status'];
}