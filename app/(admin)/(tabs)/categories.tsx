import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import {
  ActivityIndicator,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useAuth } from "@/api/use-auth";
import CategoryList from "../categories/components/CategoryList";
import CategoryModal from "../categories/components/CategoryModal";
import { useCategories } from "../categories/hooks/useCategories";
import { styles } from "../categories/styles/categoryStyles";

export default function CategoriesScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    categories,
    loading,
    refreshing,
    modalVisible,
    editModalVisible,
    selectedCategory,
    formData,
    editFormData,
    image,
    editImage,
    setModalVisible,
    setEditModalVisible,
    fetchCategories,
    handleRefresh,
    pickImage,
    handleCreateCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    openEditModal,
    resetForm,
    resetEditForm,
    handleFormChange,
  } = useCategories();

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
      fetchCategories();
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
        <Text style={styles.loadingText}>Loading Categories...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Category Management</Text>
          <Text style={styles.subtitle}>
            Manage your product categories ({categories.length} total)
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
            <Text style={styles.addButtonText}>New Category</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Categories List */}
      <CategoryList
        categories={categories}
        onEdit={openEditModal}
        onDelete={handleDeleteCategory}
        onRefresh={handleRefresh}
        refreshing={refreshing}
      />

      {/* Create Category Modal */}
      <CategoryModal
        visible={modalVisible}
        mode="create"
        formData={formData}
        image={image}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        onSubmit={handleCreateCategory}
        onImagePick={() => pickImage(false)}
        onFormChange={(field, value) => handleFormChange(field, value, false)}
      />

      {/* Edit Category Modal */}
      <CategoryModal
        visible={editModalVisible}
        mode="edit"
        formData={editFormData}
        selectedCategory={selectedCategory}
        image={editImage}
        onClose={() => {
          setEditModalVisible(false);
          resetEditForm();
        }}
        onSubmit={handleUpdateCategory}
        onImagePick={() => pickImage(true)}
        onFormChange={(field, value) => handleFormChange(field, value, true)}
      />
    </View>
  );
}
