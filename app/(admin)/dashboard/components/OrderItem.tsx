import { StyleSheet, Text, View } from 'react-native';
import { Order } from '../types/types';
import { capitalizeFirstLetter, formatRevenue, getStatusColor } from '../utils/dashboard-helpers';

interface OrderItemProps {
  order: Order;
}

export const OrderItem: React.FC<OrderItemProps> = ({ order }) => (
  <View style={styles.container}>
    <View>
      <Text style={styles.orderId}>Order #{order.id}</Text>
      <Text style={styles.customer}>{order.user_name}</Text>
      <Text style={styles.amount}>${formatRevenue(order.total_amount)}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
      <Text style={styles.statusText}>{capitalizeFirstLetter(order.status)}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  orderId: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  customer: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  amount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    textTransform: 'capitalize',
  },
});