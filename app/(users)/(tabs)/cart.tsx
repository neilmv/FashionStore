import { API, API_URL } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  stock_quantity: number;
}

export default function CartScreen() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      checkAuthStatus();
    }, [])
  );

  useEffect(() => {
    if (userToken) {
      fetchCart();
    }
  }, [userToken]);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      console.log('CartScreen - Token:', token);
      setUserToken(token);
      if (!token) {
        setCartItems([]);
        setLoading(false);
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      setLoading(false);
    }
  };

  const fetchCart = async () => {
    try {
      console.log('Fetching cart data...');
      const response = await API.get("/cart");
      console.log('Cart data received:', response.data);
      setCartItems(response.data);
    } catch (error: any) {
      console.error("Error fetching cart:", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      if (error.response?.status === 403) {
        await AsyncStorage.multiRemove(['userToken', 'userData']);
        setUserToken(null);
        Alert.alert("Session Expired", "Please login again");
      }
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      await API.put(`/cart/${itemId}`, { quantity: newQuantity });
      setCartItems((items) =>
        items.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error: any) {
      console.error("Error updating quantity:", error);
      Alert.alert("Error", "Failed to update quantity");
      fetchCart();
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      await API.delete(`/cart/${itemId}`);
      setCartItems((items) => items.filter((item) => item.id !== itemId));
      Alert.alert("Success", "Item removed from cart");
    } catch (error: any) {
      console.error("Error removing item:", error);
      Alert.alert("Error", "Failed to remove item from cart");
      fetchCart();
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const proceedToCheckout = () => {
    if (cartItems.length === 0) {
      Alert.alert("Cart Empty", "Please add items to your cart first");
      return;
    }
    router.push("/checkout");
  };

  const handleLogin = () => {
    router.push("/(auth)/login");
  };

  const handleRefresh = () => {
    if (userToken) {
      setLoading(true);
      fetchCart();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="cart-outline" size={48} color="#4A90E2" />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  if (!userToken) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Please login to view your cart</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
        >
          <Text style={styles.loginButtonText}>Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={64} color="#ccc" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptyText}>Add some items to get started</Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push("/(users)/(tabs)/explore")}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
        >
          <Ionicons name="refresh" size={20} color="#4A90E2" />
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity onPress={handleRefresh} style={styles.refreshButton}>
          <Ionicons name="refresh" size={20} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cartItems}>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.cartItem}>
            <Image
              source={{
                uri: `${API_URL.replace(/\/api\/?$/, "")}${item.image?.startsWith('/') ? '' : '/'}${item.image}`,
              }}
              style={styles.itemImage}
              
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemPrice}>${item.price}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity <= 1 && styles.quantityButtonDisabled]}
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  <Ionicons name="remove" size={16} color={item.quantity <= 1 ? "#ccc" : "#666"} />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{item.quantity}</Text>
                <TouchableOpacity
                  style={[styles.quantityButton, item.quantity >= item.stock_quantity && styles.quantityButtonDisabled]}
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  disabled={item.quantity >= item.stock_quantity}
                >
                  <Ionicons name="add" size={16} color={item.quantity >= item.stock_quantity ? "#ccc" : "#666"} />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeItem(item.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.checkoutSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total:</Text>
          <Text style={styles.totalAmount}>${getTotalPrice().toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={proceedToCheckout}
        >
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    paddingTop: 100,
    backgroundColor: "#fff",
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
  loginButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  shopButton: {
    backgroundColor: "#4A90E2",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  shopButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  refreshButtonText: {
    color: "#4A90E2",
    fontSize: 14,
    marginLeft: 4,
  },
  cartItems: {
    flex: 1,
  },
  cartItem: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonDisabled: {
    borderColor: "#eee",
    backgroundColor: "#f9f9f9",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  removeButton: {
    padding: 8,
    alignSelf: "flex-start",
  },
  checkoutSection: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "500",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  checkoutButton: {
    backgroundColor: "#4A90E2",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});