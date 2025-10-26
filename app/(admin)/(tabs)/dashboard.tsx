import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';



import { API } from '@/api/config';
import { useAuth } from '@/api/use-auth';
import { OrderItem } from '../dashboard/components/OrderItem';
import { ProductItem } from '../dashboard/components/ProductItem';
import { QuickActions } from '../dashboard/components/QuickActions';
import { SectionCard } from '../dashboard/components/SectionCard';
import { StatsCard } from '../dashboard/components/StatsCard';
import { styles } from '../dashboard/styles/dashboardStyles';
import { DashboardStats } from '../dashboard/types/types';
import { formatRevenue } from '../dashboard/utils/dashboard-helpers';


export default function DashboardScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  if (Platform.OS !== 'web') {
    router.replace('/(auth)/login');
    return null;
  }

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace('/(admin)/login')
    }
    if (isAuthenticated) {
      fetchDashboardStats();
    }
  }, [isAuthenticated]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await API.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboardStats();
  };

  const quickActions = [
    {
      title: 'Add Product',
      icon: 'add-circle' as const,
      color: '#3b82f6',
      onPress: () => router.push('/(admin)/(tabs)/products'),
    },
    {
      title: 'Manage Categories',
      icon: 'folder-open' as const,
      color: '#10b981',
      onPress: () => router.push('/(admin)/(tabs)/categories'),
    },
    {
      title: 'View Orders',
      icon: 'list' as const,
      color: '#f59e0b',
      onPress: () => router.push('/(admin)/(tabs)/orders'),
    },
    {
      title: 'Manage Users',
      icon: 'people' as const,
      color: '#ef4444',
      onPress: () => router.push('/(admin)/(tabs)/users'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Dashboard Overview</Text>
          <Text style={styles.subtitle}>Welcome to your admin panel</Text>
        </View>
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <Ionicons 
            name="refresh" 
            size={20} 
            color={refreshing ? '#9ca3af' : '#3b82f6'} 
          />
          <Text style={[
            styles.refreshText,
            { color: refreshing ? '#9ca3af' : '#3b82f6' }
          ]}>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatsCard
          title="Total Users"
          value={stats?.stats.totalUsers || 0}
          icon="people"
          color="#3b82f6"
          borderColor="#3b82f6"
        />
        <StatsCard
          title="Total Products"
          value={stats?.stats.totalProducts || 0}
          icon="shirt"
          color="#10b981"
          borderColor="#10b981"
        />
        <StatsCard
          title="Total Orders"
          value={stats?.stats.totalOrders || 0}
          icon="cart"
          color="#f59e0b"
          borderColor="#f59e0b"
        />
        <StatsCard
          title="Total Revenue"
          value={`$${formatRevenue(stats?.stats.totalRevenue)}`}
          icon="cash"
          color="#ef4444"
          borderColor="#ef4444"
        />
      </View>

      {/* Content Sections */}
      <View style={styles.sectionRow}>
        {/* Recent Orders Section */}
        <SectionCard
          title="Recent Orders"
          onViewAll={() => router.push('/(admin)/(tabs)/orders')}
        >
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.slice(0, 5).map((order) => (
              <OrderItem key={order.id} order={order} />
            ))
          ) : (
            <Text style={styles.noDataText}>No recent orders</Text>
          )}
        </SectionCard>

        {/* Low Stock Section */}
        <SectionCard
          title="Low Stock Alert"
          onViewAll={() => router.push('/(admin)/(tabs)/products')}
        >
          {stats?.lowStockProducts && stats.lowStockProducts.length > 0 ? (
            stats.lowStockProducts.slice(0, 5).map((product) => (
              <ProductItem key={product.id} product={product} />
            ))
          ) : (
            <Text style={styles.noDataText}>All products are well stocked</Text>
          )}
        </SectionCard>
      </View>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} />
    </ScrollView>
  );
}