export interface Category {
  id: number;
  name: string;
  description: string | null;
  image: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
}