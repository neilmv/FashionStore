import { API, API_URL } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

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

const ORDER_STATUS = {
  pending: { label: "Pending", color: "#FFA500", step: 1 },
  confirmed: { label: "Confirmed", color: "#4A90E2", step: 2 },
  shipped: { label: "Shipped", color: "#4A90E2", step: 3 },
  delivered: { label: "Delivered", color: "#4CAF50", step: 4 },
  cancelled: { label: "Cancelled", color: "#FF6B6B", step: 0 },
};

const OrderCard = ({
  order,
  onPress,
}: {
  order: Order;
  onPress: () => void;
}) => {
  const statusInfo =
    ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] ||
    ORDER_STATUS.pending;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderId}>Order #{order.id}</Text>
          <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}
        >
          <Text style={styles.statusText}>{statusInfo.label}</Text>
        </View>
      </View>

      <View style={styles.orderItems}>
        {order.items.slice(0, 2).map((item, index) => (
          <View key={index} style={styles.orderItem}>
            <Image
              source={{
                uri: `${API_URL.replace(
                  /\/api\/?$/,
                  ""
                )}/${item.image?.replace(/^\/?/, "")}`,
              }}
              style={styles.itemImage}
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>${item.price}</Text>
          </View>
        ))}
        {order.items.length > 2 && (
          <Text style={styles.moreItems}>
            +{order.items.length - 2} more items
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <Text style={styles.totalAmount}>${order.total_amount}</Text>
        <TouchableOpacity style={styles.trackButton} onPress={onPress}>
          <Text style={styles.trackButtonText}>Track Order</Text>
          <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

export default function OrdersScreen() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await API.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderPress = useCallback(
    (orderId: number) => {
      router.push(`/order-tracking/${orderId}`);
    },
    [router]
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading orders...</Text>
      </View>
    );
  }

  if (orders.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="bag-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>No Orders Yet</Text>
        <Text style={styles.emptyText}>Your orders will appear here</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/(users)/(tabs)/explore")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.ordersList}>
        {orders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => handleOrderPress(order.id)}
          />
        ))}
      </View>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
  },
  shopButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  ordersList: {
    padding: 16,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 2,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  moreItems: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  trackButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  trackButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 4,
  },
});
