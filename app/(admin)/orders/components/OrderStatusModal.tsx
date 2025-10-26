import { Ionicons } from "@expo/vector-icons";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Order } from "../types/order";

interface OrderStatusModalProps {
  visible: boolean;
  order: Order | null;
  getStatusColor: (status: Order['status']) => string;
  getStatusIcon: (status: Order['status']) => string;
  getStatusSteps: (status: Order['status']) => any[];
  onClose: () => void;
  onStatusUpdate: (status: Order['status']) => void;
}

export default function OrderStatusModal({
  visible,
  order,
  getStatusColor,
  getStatusIcon,
  getStatusSteps,
  onClose,
  onStatusUpdate,
}: OrderStatusModalProps) {
  if (!order) return null;

  const statusSteps = getStatusSteps(order.status);
  const availableStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

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
            <Text style={styles.modalTitle}>Update Order Status</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            {/* Order Info */}
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>Order #{order.id}</Text>
              <Text style={styles.customerInfo}>
                {order.user_name} • {order.user_email}
              </Text>
            </View>

            {/* Status Timeline */}
            <View style={styles.timelineSection}>
              <Text style={styles.sectionTitle}>Order Progress</Text>
              <View style={styles.timeline}>
                {statusSteps.map((step, index) => (
                  <View key={step.status} style={styles.timelineStep}>
                    <View style={styles.stepConnector}>
                      {index > 0 && <View style={[
                        styles.connectorLine,
                        step.completed && styles.connectorLineCompleted
                      ]} />}
                    </View>
                    
                    <View style={[
                      styles.stepIcon,
                      step.completed && styles.stepIconCompleted,
                      step.current && styles.stepIconCurrent,
                      { backgroundColor: step.completed ? getStatusColor(step.status as any) : '#e5e7eb' }
                    ]}>
                      <Ionicons 
                        name={step.icon as any} 
                        size={16} 
                        color={step.completed ? "#fff" : "#9ca3af"} 
                      />
                    </View>

                    <View style={styles.stepInfo}>
                      <Text style={[
                        styles.stepLabel,
                        step.completed && styles.stepLabelCompleted,
                        step.current && styles.stepLabelCurrent
                      ]}>
                        {step.label}
                      </Text>
                      {step.current && (
                        <Text style={styles.currentStatusText}>Current Status</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>

            {/* Status Actions */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Update Status To</Text>
              <View style={styles.statusButtons}>
                {availableStatuses.map((status) => (
                  <TouchableOpacity
                    key={status}
                    style={[
                      styles.statusButton,
                      order.status === status && styles.statusButtonCurrent,
                      { borderColor: getStatusColor(status as any) }
                    ]}
                    onPress={() => onStatusUpdate(status as Order['status'])}
                    disabled={order.status === status}
                  >
                    <Ionicons 
                      name={getStatusIcon(status as any) as any} 
                      size={18} 
                      color={order.status === status ? "#fff" : getStatusColor(status as any)} 
                    />
                    <Text style={[
                      styles.statusButtonText,
                      order.status === status && styles.statusButtonTextCurrent,
                      { color: order.status === status ? "#fff" : getStatusColor(status as any) }
                    ]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <View style={styles.modalFooter}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
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
    maxWidth: 500,
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
    padding: 24,
  },
  modalFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  orderInfo: {
    marginBottom: 24,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 4,
  },
  customerInfo: {
    fontSize: 14,
    color: '#6b7280',
  },
  timelineSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 16,
  },
  timeline: {
    gap: 8,
  },
  timelineStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepConnector: {
    width: 20,
    alignItems: 'center',
  },
  connectorLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginBottom: 4,
  },
  connectorLineCompleted: {
    backgroundColor: '#10b981',
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  stepIconCompleted: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepIconCurrent: {
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.1 }],
  },
  stepInfo: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#9ca3af',
  },
  stepLabelCompleted: {
    color: '#374151',
  },
  stepLabelCurrent: {
    color: '#1f2937',
    fontWeight: '600',
  },
  currentStatusText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  actionsSection: {
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    gap: 8,
    minWidth: 120,
  },
  statusButtonCurrent: {
    backgroundColor: '#3b82f6',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusButtonTextCurrent: {
    color: '#fff',
  },
  cancelButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
});