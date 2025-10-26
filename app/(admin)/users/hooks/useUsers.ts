import { API } from '@/api/config';
import { useAuth } from '@/api/use-auth';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { User, UserListResponse } from '../types/user';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function useUsers() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  const fetchUsers = async (page: number = 1, search: string = '') => {
    try {
      setLoading(true);
      const params: any = { page, limit: 10 };
      if (search) {
        params.search = search;
      }

      const response = await API.get<UserListResponse>('/admin/users', { params });
      setUsers(response.data.users || []);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalUsers(response.data.pagination.totalUsers);
    } catch (error: any) {
      console.error('Fetch users error:', error);
      showAlert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers(currentPage, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
    fetchUsers(1, query);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchUsers(page, searchQuery);
  };

  const updateUserRole = async (userId: number, role: 'user' | 'admin') => {
    try {
      await API.put(`/admin/users/${userId}/role`, { role });
      showAlert('Success', `User role updated to ${role}`);
      
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, role } : user
      ));
    } catch (error: any) {
      console.error('Update user role error:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to update user role');
    }
  };

  const deleteUser = async (user: User) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete user "${user.name}"? This action cannot be undone.`
      );
      if (!confirmed) return;
    }

    try {
      await API.delete(`/admin/users/${user.id}`);
      showAlert('Success', 'User deleted successfully');
      
      setUsers(prev => prev.filter(u => u.id !== user.id));
      setTotalUsers(prev => prev - 1);
      
      if (users.length === 1 && currentPage > 1) {
        fetchUsers(currentPage - 1, searchQuery);
      } else {
        fetchUsers(currentPage, searchQuery);
      }
    } catch (error: any) {
      console.error('Delete user error:', error);
      showAlert('Error', error.response?.data?.error || 'Failed to delete user');
    }
  };

  const initializeData = async () => {
    await fetchUsers();
  };

  return {
    users,
    loading,
    refreshing,
    searchQuery,
    currentPage,
    totalPages,
    totalUsers,

    fetchUsers,
    handleRefresh,
    handleSearch,
    handlePageChange,
    updateUserRole,
    deleteUser,
    initializeData,
  };
}