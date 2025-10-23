import { API, API_URL } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width: screenWidth } = Dimensions.get('window');

interface Product {
  id: number;
  name: string;
  price: number;
  original_price: number;
  image: string;
  brand: string;
  category_name: string;
}

interface Category {
  id: number;
  name: string;
  image: string;
  description: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    fetchHomeData();
    checkAuthStatus();
  }, []);

  const fetchHomeData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        API.get("/products?featured=true"),
        API.get("/categories"),
      ]);
      setFeaturedProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("userToken");
      setUserToken(token);
    } catch (error) {
      console.error("Error checking auth status:", error);
    }
  };

  const handleProductPress = (product: Product) => {
    router.push(`/product/${product.id}`);
  };

  const handleCategoryPress = (category: Category) => {
    router.push({
      pathname: "/(tabs)/explore",
      params: { category: category.name },
    });
  };

  const handleSearchPress = () => {
    router.push("/(tabs)/explore");
  };

  const handleSeeAllProducts = () => {
    router.push("/(tabs)/explore");
  };

  const handlePromoButtonPress = () => {
    router.push("/(tabs)/explore");
  };

  const handleNotificationPress = () => {
    if (!userToken) {
      Alert.alert("Login Required", "Please login to view notifications", [
        { text: "Cancel", style: "cancel" },
        { text: "Login", onPress: () => router.push("/(auth)/login") },
      ]);
      return;
    }
    Alert.alert("Notifications", "No new notifications");
  };

  const SafeImage = ({ source, style, resizeMode = "cover" }: any) => {
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(true);

    if (imageError) {
      return (
        <View style={[style, styles.imagePlaceholder]}>
          <Ionicons name="image-outline" size={32} color="#ccc" />
          <Text style={styles.placeholderText}>No Image</Text>
        </View>
      );
    }

    return (
      <View style={style}>
        <Image 
          source={source}
          style={[style, { position: 'absolute' }]}
          resizeMode={resizeMode}
          onError={() => setImageError(true)}
          onLoadEnd={() => setImageLoading(false)}
        />
        {imageLoading && (
          <View style={[style, styles.imageLoading]}>
            <Ionicons name="image-outline" size={24} color="#ccc" />
          </View>
        )}
      </View>
    );
  };

  const CategoryCard = ({ category }: { category: Category }) => (
    <TouchableOpacity
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category)}
    >
      <View style={styles.categoryImageContainer}>
        <SafeImage 
          source={{
          uri: `${API_URL.replace(/\/api\/?$/, "")}/${category.image?.replace(
            /^\/?/,
            ""
          )}`,
        }}
          style={styles.categoryImage}
          resizeMode="cover"
        />
        <View style={styles.categoryOverlay} />
        <Text style={styles.categoryName}>{category.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => handleProductPress(product)}
    >
      <View style={styles.productImageContainer}>
        <SafeImage 
          source={{
          uri: `${API_URL.replace(/\/api\/?$/, "")}/${product.image?.replace(
            /^\/?/,
            ""
          )}`,
        }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {product.original_price && product.original_price > product.price && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>
              {Math.round((1 - product.price / product.original_price) * 100)}% OFF
            </Text>
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${product.price}</Text>
          {product.original_price && product.original_price > product.price && (
            <Text style={styles.originalPrice}>${product.original_price}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="shirt-outline" size={48} color="#4A90E2" />
        <Text style={styles.loadingText}>Loading Fashion Store...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, Welcome to</Text>
          <Text style={styles.storeName}>Fashion Store</Text>
          <Text style={styles.storeTagline}>Discover your perfect style</Text>
        </View>
        <TouchableOpacity 
          style={styles.notificationButton}
          onPress={handleNotificationPress}
        >
          <Ionicons name="notifications-outline" size={24} color="#2C3E50" />
          <View style={styles.notificationDot} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.searchBar}
        onPress={handleSearchPress}
      >
        <Ionicons name="search" size={20} color="#7F8C8D" />
        <Text style={styles.searchText}>Search for clothes, brands, styles...</Text>
        <View style={styles.searchIcon}>
          <Ionicons name="options-outline" size={16} color="#7F8C8D" />
        </View>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Shop by Category</Text>
            <Text style={styles.sectionSubtitle}>Find your perfect style</Text>
          </View>
          <TouchableOpacity style={styles.seeAllButton}>
            <Text style={styles.seeAllText}>View All</Text>
            <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={categories}
          renderItem={({ item }) => <CategoryCard category={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Featured Products</Text>
            <Text style={styles.sectionSubtitle}>Curated just for you</Text>
          </View>
          <TouchableOpacity 
            style={styles.seeAllButton}
            onPress={handleSeeAllProducts}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <FlatList
          horizontal
          data={featuredProducts}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.productsList}
        />
      </View>

      <View style={styles.promoBanner}>
        <View style={styles.promoContent}>
          <Text style={styles.promoBadge}>SUMMER SALE</Text>
          <Text style={styles.promoTitle}>Up to 50% Off</Text>
          <Text style={styles.promoSubtitle}>New season styles with exclusive discounts</Text>
          <TouchableOpacity
            style={styles.promoButton}
            onPress={handlePromoButtonPress}
          >
            <Text style={styles.promoButtonText}>Shop Collection</Text>
            <Ionicons name="arrow-forward" size={16} color="#4A90E2" />
          </TouchableOpacity>
        </View>
        <View style={styles.promoPattern} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7F8C8D",
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 24,
    paddingTop: 60,
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 8,
  },
  greeting: {
    fontSize: 16,
    color: "#7F8C8D",
    marginBottom: 4,
  },
  storeName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  storeTagline: {
    fontSize: 14,
    color: "#95A5A6",
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#E74C3C",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    margin: 20,
    marginVertical: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  searchText: {
    flex: 1,
    marginLeft: 12,
    color: "#7F8C8D",
    fontSize: 16,
  },
  searchIcon: {
    padding: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#7F8C8D",
  },
  seeAllButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  seeAllText: {
    color: "#4A90E2",
    fontWeight: "600",
    marginRight: 4,
  },
  categoriesList: {
    paddingHorizontal: 16,
  },
  productsList: {
    paddingHorizontal: 16,
  },
  categoryCard: {
    marginHorizontal: 8,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  categoryImageContainer: {
    width: 120,
    height: 140,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  categoryName: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  productCard: {
    width: 180,
    marginHorizontal: 8,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: "#2C3E50",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  productImageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#E74C3C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    padding: 16,
  },
  productBrand: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: '500',
    marginBottom: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 8,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  currentPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A90E2",
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: "#95A5A6",
    textDecorationLine: "line-through",
  },
  promoBanner: {
    backgroundColor: "#2C3E50",
    margin: 20,
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
  },
  promoContent: {
    padding: 24,
    zIndex: 2,
  },
  promoBadge: {
    color: '#4A90E2',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 8,
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  promoSubtitle: {
    fontSize: 14,
    color: "#BDC3C7",
    marginBottom: 20,
    lineHeight: 20,
  },
  promoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  promoButtonText: {
    color: "#4A90E2",
    fontWeight: "bold",
    marginRight: 8,
  },
  promoPattern: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(74, 144, 226, 0.1)',
    borderRadius: 100,
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECF0F1",
  },
  placeholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#95A5A6",
  },
  imageLoading: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
  },
});