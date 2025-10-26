import { BASE_API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../types/order";

interface OrderDetailsModalProps {
  visible: boolean;
  order: Order | null;
  getStatusColor: (status: Order['status']) => string;
  getStatusIcon: (status: Order['status']) => string;
  onClose: () => void;
  onStatusUpdate: (order: Order) => void;
}

export default function OrderDetailsModal({
  visible,
  order,
  getStatusColor,
  getStatusIcon,
  onClose,
  onStatusUpdate,
}: OrderDetailsModalProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody}>
            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.summaryGrid}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Order ID</Text>
                  <Text style={styles.summaryValue}>#{order.id}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Order Date</Text>
                  <Text style={styles.summaryValue}>{formatDate(order.created_at)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={[styles.summaryValue, styles.totalAmount]}>
                    ${order.total_amount}
                  </Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Payment Method</Text>
                  <Text style={styles.summaryValue}>
                    {order.payment_method?.charAt(0).toUpperCase() + order.payment_method?.slice(1)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Status Section */}
            <View style={styles.section}>
              <View style={styles.statusHeader}>
                <Text style={styles.sectionTitle}>Order Status</Text>
                <TouchableOpacity
                  style={styles.updateStatusButton}
                  onPress={() => onStatusUpdate(order)}
                >
                  <Ionicons name="swap-vertical" size={16} color="#3b82f6" />
                  <Text style={styles.updateStatusText}>Update</Text>
                </TouchableOpacity>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                <Ionicons 
                  name={getStatusIcon(order.status) as any} 
                  size={18} 
                  color="#fff" 
                />
                <Text style={styles.statusText}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Text>
              </View>
            </View>

            {/* Customer Information */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Customer Information</Text>
              <View style={styles.customerCard}>
                <View style={styles.customerDetail}>
                  <Ionicons name="person-outline" size={16} color="#6b7280" />
                  <Text style={styles.customerText}>{order.user_name}</Text>
                </View>
                <View style={styles.customerDetail}>
                  <Ionicons name="mail-outline" size={16} color="#6b7280" />
                  <Text style={styles.customerText}>{order.user_email}</Text>
                </View>
              </View>
            </View>

            {/* Shipping Address */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Shipping Address</Text>
              <View style={styles.addressCard}>
                <Ionicons name="location-outline" size={20} color="#6b7280" />
                <Text style={styles.addressText}>{order.shipping_address}</Text>
              </View>
            </View>

            {/* Order Items */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Items ({order.items?.length || 0})</Text>
              <View style={styles.itemsList}>
                {order.items?.map((item) => (
                  <View key={item.id} style={styles.itemCard}>
                    <Image
                      source={{ uri: `${BASE_API}${item.image}` }}
                      style={styles.itemImage}
                    />
                    <View style={styles.itemInfo}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      {item.brand && (
                        <Text style={styles.itemBrand}>{item.brand}</Text>
                      )}
                      <View style={styles.itemDetails}>
                        <Text style={styles.itemPrice}>${item.price}</Text>
                        <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                      </View>
                    </View>
                    <View style={styles.itemTotal}>
                      <Text style={styles.itemTotalText}>
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.closeDetailsButton} onPress={onClose}>
              <Text style={styles.closeDetailsButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 500,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  section: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    minWidth: '45%',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  totalAmount: {
    color: '#059669',
    fontSize: 18,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  updateStatusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#eff6ff',
    gap: 4,
  },
  updateStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  customerCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  customerDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customerText: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    gap: 12,
  },
  addressText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    flex: 1,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  itemBrand: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  itemDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#059669',
  },
  itemQuantity: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemTotal: {
    alignItems: 'flex-end',
  },
  itemTotalText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
  },
  closeDetailsButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
  },
  closeDetailsButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});