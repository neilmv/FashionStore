import { API, API_URL } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  original_price: number;
  image: string;
  brand: string;
  category_name: string;
  size: string;
  color: string;
  stock_quantity: number;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    fetchProduct();
    checkAuthStatus();
  }, [id]);

  const checkAuthStatus = async () => {
    const token = await AsyncStorage.getItem("userToken");
    setUserToken(token);
  };

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
      setSelectedSize(response.data.size || "M");
    } catch (error) {
      console.error("Error fetching product:", error);
      Alert.alert("Error", "Failed to load product");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async () => {
    if (!userToken) {
      Alert.alert("Login Required", "Please login to add items to cart", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }

    try {
      await API.post("/cart", {
        productId: product?.id,
        quantity: quantity,
      });
      Alert.alert("Success", "Product added to cart");
    } catch (error) {
      console.error("Error adding to cart:", error);
      Alert.alert("Error", "Failed to add product to cart");
    }
  };

  const buyNow = async () => {
    if (!userToken) {
      Alert.alert("Login Required", "Please login to purchase", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }
    router.push({
      pathname: "/checkout",
      params: { product: JSON.stringify(product), quantity, selectedSize },
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading product...</Text>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.errorContainer}>
        <Text>Product not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Product Image */}
      <Image
        source={{
          uri: `${API_URL.replace(/\/api\/?$/, "")}/${product.image?.replace(
            /^\/?/,
            ""
          )}`,
        }}
        style={styles.productImage}
      />

      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.productName}>{product.name}</Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${product.price}</Text>
          {product.original_price && product.original_price > product.price && (
            <Text style={styles.originalPrice}>${product.original_price}</Text>
          )}
          {product.original_price && product.original_price > product.price && (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>
                {Math.round((1 - product.price / product.original_price) * 100)}
                % OFF
              </Text>
            </View>
          )}
        </View>

        {/* Description */}
        <Text style={styles.description}>{product.description}</Text>

        {/* Size Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Size</Text>
          <View style={styles.sizeContainer}>
            {sizes.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && styles.sizeButtonSelected,
                ]}
                onPress={() => setSelectedSize(size)}
              >
                <Text
                  style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Quantity Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quantity</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Ionicons name="remove" size={20} color="#666" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => setQuantity(quantity + 1)}
              disabled={quantity >= product.stock_quantity}
            >
              <Ionicons name="add" size={20} color="#666" />
            </TouchableOpacity>
          </View>
          <Text style={styles.stockText}>
            {product.stock_quantity} items available
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.addToCartButton} onPress={addToCart}>
            <Ionicons name="cart-outline" size={20} color="#4A90E2" />
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.buyNowButton} onPress={buyNow}>
            <Text style={styles.buyNowText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 400,
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    backgroundColor: "rgba(255,255,255,0.8)",
    borderRadius: 20,
    padding: 8,
  },
  productInfo: {
    padding: 20,
  },
  brand: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  productName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A90E2",
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: "#999",
    textDecorationLine: "line-through",
    marginRight: 10,
  },
  discountBadge: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  sizeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  sizeButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
  },
  sizeButtonSelected: {
    borderColor: "#4A90E2",
    backgroundColor: "#4A90E2",
  },
  sizeText: {
    fontSize: 14,
    color: "#666",
  },
  sizeTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  stockText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
    marginTop: 20,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 15,
    borderWidth: 2,
    borderColor: "#4A90E2",
    borderRadius: 10,
    gap: 10,
  },
  addToCartText: {
    color: "#4A90E2",
    fontSize: 16,
    fontWeight: "bold",
  },
  buyNowButton: {
    flex: 1,
    backgroundColor: "#4A90E2",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  buyNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
