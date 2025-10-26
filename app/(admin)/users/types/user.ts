export interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: number | string;
  created_at: string;
  updated_at?: string;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalUsers: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}