import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "@/api/use-auth";
import ProductList from "../products/components/ProductList";
import ProductModal from "../products/components/ProductModal";
import { useProducts } from "../products/hooks/useProducts";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#f3f4f6",
    marginRight: 12,
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
});

export default function ProductsScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    products,
    categories,
    loading,
    refreshing,
    modalVisible,
    editModalVisible,
    selectedProduct,
    formData,
    editFormData,
    image,
    editImage,
    setModalVisible,
    setEditModalVisible,
    fetchProducts,
    handleRefresh,
    pickImage,
    handleCreateProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    openEditModal,
    resetForm,
    resetEditForm,
    handleFormChange,
    initializeData,
  } = useProducts();

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/(auth)/login");
      return;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/(admin)/login");
      return;
    }

    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated]);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Products...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Product Management</Text>
          <Text style={styles.subtitle}>
            Manage your product catalog ({products.length} total)
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <Ionicons
              name="refresh"
              size={20}
              color={refreshing ? "#9ca3af" : "#3b82f6"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.addButtonText}>New Product</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Products List */}
      <ProductList
        products={products}
        onEdit={openEditModal}
        onDelete={handleDeleteProduct}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Create Product Modal */}
      <ProductModal
        visible={modalVisible}
        mode="create"
        formData={formData}
        categories={categories}
        image={image}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        onSubmit={handleCreateProduct}
        onImagePick={() => pickImage(false)}
        onFormChange={(field, value) => handleFormChange(field, value, false)}
      />

      {/* Edit Product Modal */}
      <ProductModal
        visible={editModalVisible}
        mode="edit"
        formData={editFormData}
        categories={categories}
        selectedProduct={selectedProduct}
        image={editImage}
        onClose={() => {
          setEditModalVisible(false);
          resetEditForm();
        }}
        onSubmit={handleUpdateProduct}
        onImagePick={() => pickImage(true)}
        onFormChange={(field, value) => handleFormChange(field, value, true)}
      />
    </View>
  );
}

