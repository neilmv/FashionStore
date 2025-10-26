import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "@/api/use-auth";

import OrderDetailsModal from "../orders/components/OrderDetailsModal";
import OrderList from "../orders/components/OrderList";
import OrderStatusModal from "../orders/components/OrderStatusModal";
import { useOrders } from "../orders/hooks/useOrder";


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 8,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#3b82f6',
  },
  filterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6b7280',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#f3f4f6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
});

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    orders,
    loading,
    refreshing,
    selectedOrder,
    statusModalVisible,
    detailsModalVisible,
    filterStatus,
    setStatusModalVisible,
    setDetailsModalVisible,
    setFilterStatus,
    fetchOrders,
    handleRefresh,
    handleStatusUpdate,
    openStatusModal,
    openDetailsModal,
    getStatusColor,
    getStatusIcon,
    getStatusSteps,
    setSelectedOrder
  } = useOrders();

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/(auth)/login");
      return;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/(admin)/login");
      return;
    }

    if (isAuthenticated) {
      fetchOrders();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchOrders();
    }
  }, [filterStatus]);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Orders...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Order Management</Text>
          <Text style={styles.subtitle}>
            Manage customer orders and track order status ({orders.length} total)
          </Text>
        </View>
        <View style={styles.headerActions}>
          {/* Status Filters */}
          <View style={styles.filterContainer}>
            {statusFilters.map((filter) => (
              <TouchableOpacity
                key={filter.value}
                style={[
                  styles.filterButton,
                  filterStatus === filter.value && styles.filterButtonActive
                ]}
                onPress={() => setFilterStatus(filter.value)}
              >
                <Text style={[
                  styles.filterButtonText,
                  filterStatus === filter.value && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={refreshing ? "#9ca3af" : "#3b82f6"}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Orders List */}
      <OrderList
        orders={orders}
        onStatusUpdate={openStatusModal}
        onViewDetails={openDetailsModal}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Status Update Modal */}
      <OrderStatusModal
        visible={statusModalVisible}
        order={selectedOrder}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        getStatusSteps={getStatusSteps}
        onClose={() => {
          setStatusModalVisible(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={(status) => {
          if (selectedOrder) {
            handleStatusUpdate(selectedOrder.id, status);
          }
        }}
      />

      {/* Order Details Modal */}
      <OrderDetailsModal
        visible={detailsModalVisible}
        order={selectedOrder}
        getStatusColor={getStatusColor}
        getStatusIcon={getStatusIcon}
        onClose={() => {
          setDetailsModalVisible(false);
          setSelectedOrder(null);
        }}
        onStatusUpdate={openStatusModal}
      />
    </View>
  );
}