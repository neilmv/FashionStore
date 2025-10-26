import { API } from "@/api/config";
import { useAuth } from "@/api/use-auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import { Order } from "../types/order";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function useOrders() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await API.get("/admin/orders", { params });
      setOrders(response.data.orders || []);
    } catch (error: any) {
      console.error("Fetch orders error:", error);
      showAlert("Error", "Failed to load orders");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleStatusUpdate = async (
    orderId: number,
    status: Order["status"]
  ) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status });
      showAlert("Success", `Order status updated to ${status}`);
      setStatusModalVisible(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      console.error("Update order status error:", error);
      showAlert(
        "Error",
        error.response?.data?.error || "Failed to update order status"
      );
    }
  };

  const openStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setStatusModalVisible(true);
  };

  const openDetailsModal = async (order: Order) => {
    try {
      setSelectedOrder(order);
      if (!order.items) {
        const response = await API.get(`/admin/orders/${order.id}`);
        setSelectedOrder(response.data);
      }
      setDetailsModalVisible(true);
    } catch (error: any) {
      console.error("Fetch order details error:", error);
      showAlert("Error", "Failed to load order details");
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    const colors = {
      pending: "#f59e0b",
      confirmed: "#3b82f6",
      shipped: "#8b5cf6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };
    return colors[status];
  };

  const getStatusIcon = (status: Order["status"]) => {
    const icons = {
      pending: "time-outline",
      confirmed: "checkmark-circle-outline",
      shipped: "car-outline",
      delivered: "checkmark-done-outline",
      cancelled: "close-circle-outline",
    };
    return icons[status];
  };

  const getStatusSteps = (currentStatus: Order["status"]) => {
    const steps = [
      { status: "pending", label: "Pending", icon: "time-outline" },
      {
        status: "confirmed",
        label: "Confirmed",
        icon: "checkmark-circle-outline",
      },
      { status: "shipped", label: "Shipped", icon: "car-outline" },
      {
        status: "delivered",
        label: "Delivered",
        icon: "checkmark-done-outline",
      },
    ];

    const currentIndex = steps.findIndex(
      (step) => step.status === currentStatus
    );

    return steps.map((step, index) => ({
      ...step,
      completed: index <= currentIndex,
      current: index === currentIndex,
    }));
  };

  return {
    orders,
    loading,
    refreshing,
    selectedOrder,
    statusModalVisible,
    detailsModalVisible,
    filterStatus,

    setStatusModalVisible,
    setDetailsModalVisible,
    setSelectedOrder,
    setFilterStatus,
    fetchOrders,
    handleRefresh,
    handleStatusUpdate,
    openStatusModal,
    openDetailsModal,
    getStatusColor,
    getStatusIcon,
    getStatusSteps,
  };
}
