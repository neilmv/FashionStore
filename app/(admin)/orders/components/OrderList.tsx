import { Ionicons } from "@expo/vector-icons";
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../types/order";

interface OrderListProps {
  orders: Order[];
  onStatusUpdate: (order: Order) => void;
  onViewDetails: (order: Order) => void;
  getStatusColor: (status: Order['status']) => string;
  getStatusIcon: (status: Order['status']) => string;
  onRefresh: () => void;
  refreshing: boolean;
}

const { width } = Dimensions.get('window');

export default function OrderList({ 
  orders, 
  onStatusUpdate, 
  onViewDetails, 
  getStatusColor, 
  getStatusIcon,
  onRefresh,
  refreshing 
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="cart-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No Orders Found</Text>
        <Text style={styles.emptyStateText}>
          When customers place orders, they will appear here for management.
        </Text>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAddress = (address: string) => {
    return address.length > 40 ? address.substring(0, 40) + '...' : address;
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getGridColumns = () => {
    if (width >= 1400) return 3;
    if (width >= 1024) return 2;
    return 1;
  };

  const gridColumns = getGridColumns();

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.ordersGrid, { gridTemplateColumns: `repeat(${gridColumns}, 1fr)` }]}>
        {orders.map((order) => (
          <View key={order.id} style={styles.orderCard}>
            {/* Order Header */}
            <View style={styles.orderHeader}>
              <View style={styles.orderInfo}>
                <Text style={styles.orderId}>Order #{order.id}</Text>
                <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Ionicons 
                  name={getStatusIcon(order.status) as any} 
                  size={14} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Customer Info */}
            <View style={styles.customerInfo}>
              <View style={styles.customerAvatar}>
                <Ionicons name="person-outline" size={16} color="#6b7280" />
              </View>
              <View style={styles.customerDetails}>
                <Text style={styles.customerName}>{order.user_name}</Text>
                <Text style={styles.customerEmail}>{order.user_email}</Text>
              </View>
            </View>

            {/* Order Summary */}
            <View style={styles.orderSummary}>
              <View style={styles.summaryItem}>
                <Ionicons name="cash-outline" size={16} color="#059669" />
                <Text style={styles.summaryAmount}>{formatPrice(order.total_amount)}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Ionicons name="card-outline" size={14} color="#6b7280" />
                <Text style={styles.paymentMethod}>
                  {order.payment_method?.charAt(0).toUpperCase() + order.payment_method?.slice(1)}
                </Text>
              </View>
            </View>

            {/* Shipping Address */}
            <View style={styles.addressSection}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.addressText}>{formatAddress(order.shipping_address)}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, styles.detailsButton]}
                onPress={() => onViewDetails(order)}
              >
                <Ionicons name="eye-outline" size={16} color="#3b82f6" />
                <Text style={styles.detailsButtonText}>Details</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, styles.statusButton]}
                onPress={() => onStatusUpdate(order)}
              >
                <Ionicons name="swap-vertical-outline" size={16} color="#f59e0b" />
                <Text style={styles.statusButtonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  ordersGrid: {
    display: 'grid' as any,
    gap: 16,
    padding: 20,
  },
  orderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minHeight: 200,
    flex: 1,
    margin: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  customerAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  orderSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  paymentMethod: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  addressSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  addressText: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
    lineHeight: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 'auto',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  detailsButton: {
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
  },
  detailsButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusButton: {
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f59e0b',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
});