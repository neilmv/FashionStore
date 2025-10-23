import { API } from '@/api/config';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface Order {
  id: number;
  total_amount: number;
  status: string;
  shipping_address: string;
  payment_method: string;
  created_at: string;
  items: Array<{
    product_id: number;
    quantity: number;
    price: number;
    name: string;
    image: string;
  }>;
}

const TRACKING_STEPS = [
  { key: 'pending', label: 'Order Placed', description: 'We have received your order' },
  { key: 'confirmed', label: 'Order Confirmed', description: 'Your order is being processed' },
  { key: 'shipped', label: 'Shipped', description: 'Your order is on the way' },
  { key: 'delivered', label: 'Delivered', description: 'Order delivered successfully' },
];

export default function OrderTrackingScreen() {
  const { id } = useLocalSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await API.get('/orders');
      const foundOrder = response.data.find((o: Order) => o.id.toString() === id);
      setOrder(foundOrder || null);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStepIndex = () => {
    if (!order) return 0;
    return TRACKING_STEPS.findIndex(step => step.key === order.status);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading order details...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ccc" />
        <Text style={styles.errorText}>Order not found</Text>
      </View>
    );
  }

  const currentStepIndex = getCurrentStepIndex();

  return (
    <ScrollView style={styles.container}>
      {/* Order Header */}
      <View style={styles.header}>
        <Text style={styles.orderNumber}>Order #{order.id}</Text>
        <Text style={styles.orderDate}>Placed on {formatDate(order.created_at)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
          <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
        </View>
      </View>

      {/* Tracking Progress */}
      <View style={styles.trackingSection}>
        <Text style={styles.sectionTitle}>Order Tracking</Text>
        <View style={styles.timeline}>
          {TRACKING_STEPS.map((step, index) => (
            <View key={step.key} style={styles.timelineStep}>
              <View style={styles.stepIndicator}>
                <View style={[
                  styles.stepCircle,
                  index <= currentStepIndex && styles.stepCircleCompleted,
                ]}>
                  {index <= currentStepIndex && (
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  )}
                </View>
                {index < TRACKING_STEPS.length - 1 && (
                  <View style={[
                    styles.stepLine,
                    index < currentStepIndex && styles.stepLineCompleted,
                  ]} />
                )}
              </View>
              <View style={styles.stepInfo}>
                <Text style={[
                  styles.stepLabel,
                  index <= currentStepIndex && styles.stepLabelCompleted,
                ]}>
                  {step.label}
                </Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Items</Text>
        {order.items.map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <View style={styles.itemDetails}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        ))}
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>
            ${(order.total_amount - 5.99 - (order.total_amount * 0.08)).toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>$5.99</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${(order.total_amount * 0.08).toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${order.total_amount}</Text>
        </View>
      </View>

      {/* Shipping Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Information</Text>
        <Text style={styles.shippingAddress}>{order.shipping_address}</Text>
        <View style={styles.paymentMethod}>
          <Ionicons name="card-outline" size={20} color="#666" />
          <Text style={styles.paymentText}>{order.payment_method}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

function getStatusColor(status: string): string {
  const colors: { [key: string]: string } = {
    pending: '#FFA500',
    confirmed: '#4A90E2',
    shipped: '#4A90E2',
    delivered: '#4CAF50',
    cancelled: '#FF6B6B',
  };
  return colors[status] || '#666';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 16,
  },
  header: {
    padding: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  orderNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  trackingSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  timeline: {
    marginLeft: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  stepIndicator: {
    alignItems: 'center',
    marginRight: 16,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  stepCircleCompleted: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  stepLine: {
    width: 2,
    flex: 1,
    backgroundColor: '#ddd',
    marginTop: 4,
  },
  stepLineCompleted: {
    backgroundColor: '#4A90E2',
  },
  stepInfo: {
    flex: 1,
    paddingTop: 4,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
    color: '#666',
  },
  stepLabelCompleted: {
    color: '#000',
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
  orderItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#666',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4A90E2',
  },
  shippingAddress: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentText: {
    fontSize: 16,
    marginLeft: 8,
    color: '#666',
  },
});