import { API, API_URL } from '@/api/config';
import { useAuth } from '@/api/use-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform } from 'react-native';
import { Category, CreateCategoryData, UpdateCategoryData } from '../types/category';

const showAlert = (title: string, message: string) => {
  if (Platform.OS === 'web') {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function useCategories() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    description: "",
  });
  const [editFormData, setEditFormData] = useState<UpdateCategoryData>({});
  const [image, setImage] = useState<any>(null);
  const [editImage, setEditImage] = useState<any>(null);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/categories");
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Fetch categories error:", error);
      showAlert("Error", "Failed to load categories");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCategories();
  };

  const pickImage = async (isEdit = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        if (isEdit) {
          setEditImage(result.assets[0]);
        } else {
          setImage(result.assets[0]);
        }
      }
    } catch (error) {
      showAlert("Error", "Failed to pick image");
    }
  };

  const handleCreateCategory = async () => {
    if (!formData.name?.trim()) {
      showAlert("Error", "Category name is required");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);

      if (formData.description) {
        submitData.append("description", formData.description);
      }

      if (image) {
        if (Platform.OS === "web") {
          const response = await fetch(image.uri);
          const blob = await response.blob();

          let fileExtension = "png";
          let mimeType = "image/png";

          if (blob.type) {
            mimeType = blob.type;
            const mimeToExt: { [key: string]: string } = {
              "image/jpeg": "jpg",
              "image/jpg": "jpg",
              "image/png": "png",
              "image/gif": "gif",
              "image/webp": "webp",
              "image/avif": "avif",
            };
            fileExtension = mimeToExt[blob.type] || "png";
          }

          const fileName = `category-${Date.now()}.${fileExtension}`;
          const file = new File([blob], fileName, { type: mimeType });
          submitData.append("image", file);
        } else {
          const fileExtension = image.uri.split(".").pop() || "jpg";
          const fileName = `category-${Date.now()}.${fileExtension}`;

          submitData.append("image", {
            uri: image.uri,
            type: `image/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_URL}/admin/categories`,
        {
          method: "POST",
          body: submitData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Request failed" };
        }
        throw new Error(errorData.error || "Request failed");
      }

      await response.json();
      showAlert("Success", "Category created successfully");
      setModalVisible(false);
      resetForm();
      fetchCategories();
    } catch (error: any) {
      console.error("Create category error:", error);
      showAlert("Error", error.message || "Failed to create category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;

    try {
      const submitData = new FormData();
      
      if (editFormData.name) {
        submitData.append("name", editFormData.name);
      }
      if (editFormData.description !== undefined) {
        submitData.append("description", editFormData.description);
      }
      
      if (editImage) {
        if (Platform.OS === "web") {
          const response = await fetch(editImage.uri);
          const blob = await response.blob();

          let fileExtension = "png";
          let mimeType = "image/png";

          if (blob.type) {
            mimeType = blob.type;
            const mimeToExt: { [key: string]: string } = {
              "image/jpeg": "jpg",
              "image/jpg": "jpg",
              "image/png": "png",
              "image/gif": "gif",
              "image/webp": "webp",
              "image/avif": "avif",
            };
            fileExtension = mimeToExt[blob.type] || "png";
          }

          const fileName = `category-${Date.now()}.${fileExtension}`;
          const file = new File([blob], fileName, { type: mimeType });
          submitData.append("image", file);
        } else {
          const fileExtension = editImage.uri.split(".").pop() || "jpg";
          const fileName = `category-${Date.now()}.${fileExtension}`;

          submitData.append("image", {
            uri: editImage.uri,
            type: `image/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_URL}/admin/categories/${selectedCategory.id}`,
        {
          method: "PUT",
          body: submitData,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { error: errorText || "Request failed" };
        }
        throw new Error(errorData.error || "Request failed");
      }

      await response.json();
      showAlert("Success", "Category updated successfully");
      setEditModalVisible(false);
      resetEditForm();
      fetchCategories();
    } catch (error: any) {
      console.error("Update category error:", error);
      showAlert("Error", error.message || "Failed to update category");
    }
  };

  const handleDeleteCategory = (category: Category) => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`
      );
      if (confirmed) {
        deleteCategory(category.id);
      }
    } else {
      Alert.alert(
        "Delete Category",
        `Are you sure you want to delete "${category.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteCategory(category.id),
          },
        ]
      );
    }
  };

  const deleteCategory = async (categoryId: number) => {
    try {
      console.log("Deleting category with ID:", categoryId);
      
      const response = await API.delete(`/admin/categories/${categoryId}`);
      
      console.log("Delete response:", response.data);
      showAlert("Success", "Category deleted successfully");
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      fetchCategories();
    } catch (error: any) {
      console.error("Delete category error:", error);
      
      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          "Failed to delete category";
      
      showAlert("Error", errorMessage);
    }
  };

  const openEditModal = (category: Category) => {
    setSelectedCategory(category);
    setEditFormData({
      name: category.name,
      description: category.description || "",
    });
    setEditImage(null);
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setFormData({ name: "", description: "" });
    setImage(null);
  };

  const resetEditForm = () => {
    setEditFormData({});
    setEditImage(null);
    setSelectedCategory(null);
  };

  const handleFormChange = (field: string, value: string, isEdit = false) => {
    if (isEdit) {
      setEditFormData(prev => ({ ...prev, [field]: value }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return {
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
  };
}