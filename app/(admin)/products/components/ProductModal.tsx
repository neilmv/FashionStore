import { BASE_API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Image,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    CreateProductData,
    Product,
    UpdateProductData,
} from "../types/product";

interface ProductModalProps {
  visible: boolean;
  mode: "create" | "edit";
  formData: CreateProductData | UpdateProductData;
  categories: any[];
  selectedProduct?: Product | null;
  image: any;
  onClose: () => void;
  onSubmit: () => void;
  onImagePick: (isEdit: boolean) => void;
  onFormChange: (
    field: string,
    value: string | number,
    isEdit: boolean
  ) => void;
}

export default function ProductModal({
  visible,
  mode,
  formData,
  categories,
  selectedProduct,
  image,
  onClose,
  onSubmit,
  onImagePick,
  onFormChange,
}: ProductModalProps) {
  const isEdit = mode === "edit";
  const title = isEdit ? "Edit Product" : "Create New Product";
  const buttonText = isEdit ? "Update Product" : "Create Product";

  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const selectedCategory = categories.find(
    (cat) => cat.id === formData.category_id
  );
  const selectedCategoryName = selectedCategory?.name || "Select Category";

  const handleInputChange = (field: string, value: string | number) => {
    onFormChange(field, value, isEdit);
  };

  const handleCategorySelect = (categoryId: number) => {
    handleInputChange("category_id", categoryId);
    setShowCategoryDropdown(false);
  };

  return (
    <>
      {/* Main Product Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter product name"
                  value={formData.name?.toString() || ""}
                  onChangeText={(text) => handleInputChange("name", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter product description"
                  value={formData.description?.toString() || ""}
                  onChangeText={(text) =>
                    handleInputChange("description", text)
                  }
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Price *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={formData.price?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange("price", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Original Price</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    value={formData.original_price?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange("original_price", parseFloat(text) || 0)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Category *</Text>
                  <TouchableOpacity
                    style={styles.select}
                    onPress={() => setShowCategoryDropdown(true)}
                  >
                    <Text
                      style={[
                        styles.selectText,
                        !formData.category_id && styles.selectTextPlaceholder,
                      ]}
                    >
                      {selectedCategoryName}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="#6b7280" />
                  </TouchableOpacity>
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Stock Quantity *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    value={formData.stock_quantity?.toString() || ""}
                    onChangeText={(text) =>
                      handleInputChange("stock_quantity", parseInt(text) || 0)
                    }
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Size</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., M, L, XL"
                    value={formData.size?.toString() || ""}
                    onChangeText={(text) => handleInputChange("size", text)}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Color</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Red, Blue"
                    value={formData.color?.toString() || ""}
                    onChangeText={(text) => handleInputChange("color", text)}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Brand</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter brand name"
                  value={formData.brand?.toString() || ""}
                  onChangeText={(text) => handleInputChange("brand", text)}
                />
              </View>

              <View style={styles.formGroup}>
                <View style={styles.checkboxContainer}>
                  <TouchableOpacity
                    style={[
                      styles.checkbox,
                      formData.is_featured ? styles.checkboxChecked : null,
                    ]}
                    onPress={() =>
                      handleInputChange(
                        "is_featured",
                        formData.is_featured ? 0 : 1
                      )
                    }
                  >
                    {formData.is_featured && (
                      <Ionicons name="checkmark" size={16} color="#fff" />
                    )}
                  </TouchableOpacity>
                  <Text style={styles.checkboxLabel}>Featured Product</Text>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Product Image</Text>
                <TouchableOpacity
                  style={styles.imagePicker}
                  onPress={() => onImagePick(isEdit)}
                >
                  {image ? (
                    <Image
                      source={{ uri: image.uri }}
                      style={styles.previewImage}
                    />
                  ) : isEdit && selectedProduct?.image ? (
                    <Image
                      source={{
                        uri: `${BASE_API}${selectedProduct.image}`,
                      }}
                      style={styles.previewImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Ionicons
                        name="camera-outline"
                        size={32}
                        color="#9ca3af"
                      />
                      <Text style={styles.imagePlaceholderText}>
                        Tap to select an image
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
                {isEdit && selectedProduct?.image && (
                  <Text style={styles.imageNote}>
                    Current image will be replaced
                  </Text>
                )}
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
                <Text style={styles.submitButtonText}>{buttonText}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Category Dropdown Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showCategoryDropdown}
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <View style={styles.dropdownOverlay}>
          <View style={styles.dropdownContent}>
            <View style={styles.dropdownHeader}>
              <Text style={styles.dropdownTitle}>Select Category</Text>
              <TouchableOpacity
                onPress={() => setShowCategoryDropdown(false)}
                style={styles.dropdownCloseButton}
              >
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.dropdownList}>
              {categories.length === 0 ? (
                <Text style={styles.noCategoriesText}>
                  No categories available
                </Text>
              ) : (
                categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      formData.category_id === category.id &&
                        styles.categoryOptionSelected,
                    ]}
                    onPress={() => handleCategorySelect(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        formData.category_id === category.id &&
                          styles.categoryOptionTextSelected,
                      ]}
                    >
                      {category.name}
                    </Text>
                    {formData.category_id === category.id && (
                      <Ionicons name="checkmark" size={16} color="#3b82f6" />
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "90%",
    maxWidth: 600,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    maxHeight: 400,
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  formGroup: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  formRow: {
    flexDirection: "row",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  select: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  selectText: {
    fontSize: 14,
    color: "#374151",
  },
  selectTextPlaceholder: {
    color: "#9ca3af",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
  checkboxLabel: {
    fontSize: 14,
    color: "#374151",
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: "#d1d5db",
    borderStyle: "dashed",
    borderRadius: 8,
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  imagePlaceholder: {
    alignItems: "center",
  },
  imagePlaceholderText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 8,
  },
  imageNote: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    fontStyle: "italic",
  },
  cancelButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    marginRight: 12,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  submitButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    backgroundColor: "#3b82f6",
  },
  submitButtonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#fff",
  },

  dropdownOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dropdownContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    width: "100%",
    maxWidth: 400,
    maxHeight: "60%",
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  dropdownTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  dropdownCloseButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 300,
  },
  categoryOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  categoryOptionSelected: {
    backgroundColor: "#f0f9ff",
  },
  categoryOptionText: {
    fontSize: 14,
    color: "#374151",
  },
  categoryOptionTextSelected: {
    color: "#3b82f6",
    fontWeight: "500",
  },
  noCategoriesText: {
    textAlign: "center",
    padding: 20,
    fontSize: 14,
    color: "#6b7280",
    fontStyle: "italic",
  },
});
