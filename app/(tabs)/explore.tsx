import { API, API_URL } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
}

export default function ExploreScreen() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    searchProducts();
  }, [searchQuery, selectedCategory]);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        API.get("/products"),
        API.get("/categories"),
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const searchProducts = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory !== "All")
        params.append("category", selectedCategory);
      if (searchQuery) params.append("search", searchQuery);

      const response = await API.get(`/products?${params}`);
      setProducts(response.data);
    } catch (error) {
      console.error("Error searching products:", error);
    }
  };

  const ProductCard = ({ product }: { product: Product }) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => router.push(`/product/${product.id}`)}
    >
      <Image
        source={{
          uri: `${API_URL.replace(/\/api\/?$/, "")}/${product.image?.replace(
            /^\/?/,
            ""
          )}`,
        }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>${product.price}</Text>
          {product.original_price && product.original_price > product.price && (
            <Text style={styles.originalPrice}>${product.original_price}</Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for clothes, brands..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesContainer}
      >
        <TouchableOpacity
          style={[
            styles.categoryChip,
            selectedCategory === "All" && styles.categoryChipActive,
          ]}
          onPress={() => setSelectedCategory("All")}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategory === "All" && styles.categoryTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryChip,
              selectedCategory === category.name && styles.categoryChipActive,
            ]}
            onPress={() => setSelectedCategory(category.name)}
          >
            <Text
              style={[
                styles.categoryText,
                selectedCategory === category.name && styles.categoryTextActive,
              ]}
            >
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Products Grid */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <Text>Loading products...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={({ item }) => <ProductCard product={item} />}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.productsGrid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    margin: 16,
    padding: 12,
    borderRadius: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f5f5f5",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#4A90E2",
  },
  categoryText: {
    fontSize: 14,
    color: "#666",
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  productsGrid: {
    padding: 8,
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: "46%",
  },
  productImage: {
    width: "100%",
    height: 150,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
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
    color: "#999",
    textDecorationLine: "line-through",
  },
});
