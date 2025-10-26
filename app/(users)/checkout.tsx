import { API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
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
}

interface ShippingAddress {
  fullName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

export default function CheckoutScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState("card");
  const [address, setAddress] = useState<ShippingAddress>({
    fullName: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
    phone: "",
  });

  useEffect(() => {
    const initializeCheckout = async () => {
      if (params.product) {
        const product = JSON.parse(params.product as string);
        const quantity = parseInt(params.quantity as string) || 1;
        setCartItems([
          {
            id: 0,
            product_id: product.id,
            quantity: quantity,
            name: product.name,
            price: product.price,
            image: product.image,
          },
        ]);
      } else {
        await fetchCartItems();
      }
      await loadUserAddress();
    };

    initializeCheckout();
  }, []);

  const fetchCartItems = async () => {
    try {
      const response = await API.get("/cart");
      setCartItems(response.data);
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const loadUserAddress = async () => {
    const savedAddress = await AsyncStorage.getItem("userAddress");
    if (savedAddress) {
      setAddress(JSON.parse(savedAddress));
    }
  };

  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const getShipping = () => 5.99;
  const getTax = () => getSubtotal() * 0.08; // 8% tax
  const getTotal = () => getSubtotal() + getShipping() + getTax();

  const handlePlaceOrder = async () => {
    if (
      !address.fullName ||
      !address.address ||
      !address.city ||
      !address.zipCode
    ) {
      Alert.alert("Error", "Please fill in all required address fields");
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
        totalAmount: getTotal(),
        shippingAddress: `${address.fullName}, ${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`,
        paymentMethod: selectedPayment,
      };

      const response = await API.post("/orders", orderData);

      await AsyncStorage.setItem("userAddress", JSON.stringify(address));

      Alert.alert(
        "Order Placed!",
        `Your order #${response.data.orderId} has been placed successfully.`,
        [
          {
            text: "Track Order",
            onPress: () =>
              router.push(`/order-tracking/${response.data.orderId}`),
          },
          {
            text: "Continue Shopping",
            onPress: () => router.replace("/(users)/(tabs)"),
          },
        ]
      );
    } catch (error: any) {
      console.error("Order error:", error);
      Alert.alert(
        "Error",
        error.response?.data?.error || "Failed to place order"
      );
    } finally {
      setLoading(false);
    }
  };

  const PaymentMethod = ({ method, icon, title, description }: any) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        selectedPayment === method && styles.paymentMethodSelected,
      ]}
      onPress={() => setSelectedPayment(method)}
    >
      <View style={styles.paymentHeader}>
        <Ionicons name={icon} size={24} color="#4A90E2" />
        <View style={styles.paymentInfo}>
          <Text style={styles.paymentTitle}>{title}</Text>
          <Text style={styles.paymentDescription}>{description}</Text>
        </View>
        <View
          style={[
            styles.radio,
            selectedPayment === method && styles.radioSelected,
          ]}
        >
          {selectedPayment === method && <View style={styles.radioInner} />}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Shipping Address</Text>
        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Full Name *"
            value={address.fullName}
            onChangeText={(text) =>
              setAddress((prev) => ({ ...prev, fullName: text }))
            }
          />
          <TextInput
            style={styles.input}
            placeholder="Street Address *"
            value={address.address}
            onChangeText={(text) =>
              setAddress((prev) => ({ ...prev, address: text }))
            }
          />
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="City *"
              value={address.city}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, city: text }))
              }
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="State"
              value={address.state}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, state: text }))
              }
            />
          </View>
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="ZIP Code *"
              value={address.zipCode}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, zipCode: text }))
              }
              keyboardType="numeric"
            />
            <TextInput
              style={[styles.input, styles.halfInput]}
              placeholder="Country"
              value={address.country}
              onChangeText={(text) =>
                setAddress((prev) => ({ ...prev, country: text }))
              }
            />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Phone Number"
            value={address.phone}
            onChangeText={(text) =>
              setAddress((prev) => ({ ...prev, phone: text }))
            }
            keyboardType="phone-pad"
          />
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <PaymentMethod
          method="card"
          icon="card-outline"
          title="Credit/Debit Card"
          description="Pay with your credit or debit card"
        />
        <PaymentMethod
          method="paypal"
          icon="logo-paypal"
          title="PayPal"
          description="Pay with your PayPal account"
        />
        <PaymentMethod
          method="cod"
          icon="cash-outline"
          title="Cash on Delivery"
          description="Pay when you receive your order"
        />
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        {cartItems.map((item) => (
          <View key={item.id} style={styles.orderItem}>
            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.name}</Text>
              <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
            </View>
            <Text style={styles.itemPrice}>
              ${(item.price * item.quantity).toFixed(2)}
            </Text>
          </View>
        ))}

        <View style={styles.divider} />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>${getSubtotal().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={styles.summaryValue}>${getShipping().toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Tax</Text>
          <Text style={styles.summaryValue}>${getTax().toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>${getTotal().toFixed(2)}</Text>
        </View>
      </View>

      {/* Place Order Button */}
      <TouchableOpacity
        style={[
          styles.placeOrderButton,
          loading && styles.placeOrderButtonDisabled,
        ]}
        onPress={handlePlaceOrder}
        disabled={loading || cartItems.length === 0}
      >
        <Text style={styles.placeOrderButtonText}>
          {loading
            ? "Placing Order..."
            : `Place Order - $${getTotal().toFixed(2)}`}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  form: {
    gap: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
  },
  paymentMethod: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  paymentMethodSelected: {
    borderColor: "#4A90E2",
    backgroundColor: "#F0F8FF",
  },
  paymentHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  paymentDescription: {
    fontSize: 14,
    color: "#666",
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  radioSelected: {
    borderColor: "#4A90E2",
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#4A90E2",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  divider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginVertical: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "bold",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A90E2",
  },
  placeOrderButton: {
    backgroundColor: "#4A90E2",
    margin: 20,
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  placeOrderButtonDisabled: {
    backgroundColor: "#ccc",
  },
  placeOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
