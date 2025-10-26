import { API, API_URL } from "@/api/config";
import { useAuth } from "@/api/use-auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Platform } from "react-native";
import {
    CreateProductData,
    Product,
    UpdateProductData,
} from "../types/product";

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

export function useProducts() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<CreateProductData>({
    name: "",
    description: "",
    price: 0,
    original_price: 0,
    category_id: 0,
    size: "",
    color: "",
    brand: "",
    stock_quantity: 0,
    is_featured: 0,
  });
  const [editFormData, setEditFormData] = useState<UpdateProductData>({});
  const [image, setImage] = useState<any>(null);
  const [editImage, setEditImage] = useState<any>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/products");
      setProducts(response.data.products || []);
    } catch (error: any) {
      console.error("Fetch products error:", error);
      showAlert("Error", "Failed to load products");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await API.get("/admin/categories");
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Fetch categories error:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchProducts();
  };

  const pickImage = async (isEdit = false) => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
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

  const handleCreateProduct = async () => {
    if (!formData.name?.trim()) {
      showAlert("Error", "Product name is required");
      return;
    }
    if (!formData.category_id) {
      showAlert("Error", "Category is required");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      showAlert("Error", "Valid price is required");
      return;
    }

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("price", formData.price.toString());
      submitData.append("category_id", formData.category_id.toString());
      submitData.append("stock_quantity", formData.stock_quantity.toString());

      if (formData.description) {
        submitData.append("description", formData.description);
      }
      if (formData.original_price) {
        submitData.append("original_price", formData.original_price.toString());
      }
      if (formData.size) {
        submitData.append("size", formData.size);
      }
      if (formData.color) {
        submitData.append("color", formData.color);
      }
      if (formData.brand) {
        submitData.append("brand", formData.brand);
      }
      if (formData.is_featured !== undefined) {
        submitData.append("is_featured", formData.is_featured.toString());
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

          const fileName = `product-${Date.now()}.${fileExtension}`;
          const file = new File([blob], fileName, { type: mimeType });
          submitData.append("image", file);
        } else {
          const fileExtension = image.uri.split(".").pop() || "jpg";
          const fileName = `product-${Date.now()}.${fileExtension}`;

          submitData.append("image", {
            uri: image.uri,
            type: `image/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(`${API_URL}/admin/products`, {
        method: "POST",
        body: submitData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

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
      showAlert("Success", "Product created successfully");
      setModalVisible(false);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Create product error:", error);
      showAlert("Error", error.message || "Failed to create product");
    }
  };

  const handleUpdateProduct = async () => {
    if (!selectedProduct) return;

    try {
      const submitData = new FormData();

      if (editFormData.name) {
        submitData.append("name", editFormData.name);
      }
      if (editFormData.description !== undefined) {
        submitData.append("description", editFormData.description);
      }
      if (editFormData.price !== undefined) {
        submitData.append("price", editFormData.price.toString());
      }
      if (editFormData.original_price !== undefined) {
        submitData.append(
          "original_price",
          editFormData.original_price.toString()
        );
      }
      if (editFormData.category_id !== undefined) {
        submitData.append("category_id", editFormData.category_id.toString());
      }
      if (editFormData.size !== undefined) {
        submitData.append("size", editFormData.size);
      }
      if (editFormData.color !== undefined) {
        submitData.append("color", editFormData.color);
      }
      if (editFormData.brand !== undefined) {
        submitData.append("brand", editFormData.brand);
      }
      if (editFormData.stock_quantity !== undefined) {
        submitData.append(
          "stock_quantity",
          editFormData.stock_quantity.toString()
        );
      }
      if (editFormData.is_featured !== undefined) {
        submitData.append("is_featured", editFormData.is_featured.toString());
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

          const fileName = `product-${Date.now()}.${fileExtension}`;
          const file = new File([blob], fileName, { type: mimeType });
          submitData.append("image", file);
        } else {
          const fileExtension = editImage.uri.split(".").pop() || "jpg";
          const fileName = `product-${Date.now()}.${fileExtension}`;

          submitData.append("image", {
            uri: editImage.uri,
            type: `image/${fileExtension}`,
            name: fileName,
          } as any);
        }
      }

      const token = await AsyncStorage.getItem("userToken");
      const response = await fetch(
        `${API_URL}/admin/products/${selectedProduct.id}`,
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
      showAlert("Success", "Product updated successfully");
      setEditModalVisible(false);
      resetEditForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Update product error:", error);
      showAlert("Error", error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = (product: Product) => {
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`
      );
      if (confirmed) {
        deleteProduct(product.id);
      }
    } else {
      Alert.alert(
        "Delete Product",
        `Are you sure you want to delete "${product.name}"? This action cannot be undone.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteProduct(product.id),
          },
        ]
      );
    }
  };

  const deleteProduct = async (productId: number) => {
    try {
      console.log("Deleting product with ID:", productId);

      const response = await API.delete(`/admin/products/${productId}`);

      console.log("Delete response:", response.data);
      showAlert("Success", "Product deleted successfully");

      setProducts((prev) => prev.filter((prod) => prod.id !== productId));

      fetchProducts();
    } catch (error: any) {
      console.error("Delete product error:", error);

      if (error.response) {
        console.error("Response error:", error.response.data);
        console.error("Response status:", error.response.status);
      }

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Failed to delete product";

      showAlert("Error", errorMessage);
    }
  };

  const openEditModal = (product: Product) => {
    setSelectedProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      original_price: product.original_price || 0,
      category_id: product.category_id,
      size: product.size || "",
      color: product.color || "",
      brand: product.brand || "",
      stock_quantity: product.stock_quantity,
      is_featured: product.is_featured,
    });
    setEditImage(null);
    setEditModalVisible(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      original_price: 0,
      category_id: 0,
      size: "",
      color: "",
      brand: "",
      stock_quantity: 0,
      is_featured: 0,
    });
    setImage(null);
  };

  const resetEditForm = () => {
    setEditFormData({});
    setEditImage(null);
    setSelectedProduct(null);
  };

  const handleFormChange = (
    field: string,
    value: string | number,
    isEdit = false
  ) => {
    console.log(
      `Form change - Field: ${field}, Value: ${value}, IsEdit: ${isEdit}`
    );

    if (isEdit) {
      setEditFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const initializeData = async () => {
    await Promise.all([fetchProducts(), fetchCategories()]);
  };

  return {
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
  };
}
