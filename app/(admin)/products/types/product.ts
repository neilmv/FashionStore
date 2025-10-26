export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  category_id: number;
  size: string | null;
  color: string | null;
  brand: string | null;
  image: string | null;
  stock_quantity: number;
  is_featured: number;
  created_at: string;
  updated_at: string;
  category_name?: string;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  original_price?: number;
  category_id: number;
  size?: string;
  color?: string;
  brand?: string;
  stock_quantity: number;
  is_featured?: number;
}

export interface UpdateProductData {
  name?: string;
  description?: string;
  price?: number;
  original_price?: number;
  category_id?: number;
  size?: string;
  color?: string;
  brand?: string;
  stock_quantity?: number;
  is_featured?: number;
}