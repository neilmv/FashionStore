import { BASE_API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/categoryStyles";
import { Category, CreateCategoryData, UpdateCategoryData } from "../types/category";


interface CategoryModalProps {
  visible: boolean;
  mode: 'create' | 'edit';
  formData: CreateCategoryData | UpdateCategoryData;
  selectedCategory?: Category | null;
  image: any;
  onClose: () => void;
  onSubmit: () => void;
  onImagePick: (isEdit: boolean) => void;
  onFormChange: (field: string, value: string) => void;
}

export default function CategoryModal({
  visible,
  mode,
  formData,
  selectedCategory,
  image,
  onClose,
  onSubmit,
  onImagePick,
  onFormChange,
}: CategoryModalProps) {
  const isEdit = mode === 'edit';
  const title = isEdit ? 'Edit Category' : 'Create New Category';
  const buttonText = isEdit ? 'Update Category' : 'Create Category';

  return (
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
              <Text style={styles.label}>Category Name {!isEdit && '*'}</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={formData.name || ''}
                onChangeText={(text) => onFormChange('name', text)}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter category description (optional)"
                value={formData.description || ''}
                onChangeText={(text) => onFormChange('description', text)}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Category Image</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => onImagePick(isEdit)}
              >
                {image ? (
                  <Image
                    source={{ uri: image.uri }}
                    style={styles.previewImage}
                  />
                ) : isEdit && selectedCategory?.image ? (
                  <Image
                    source={{
                      uri: `${BASE_API}${selectedCategory.image}`,
                    }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#9ca3af" />
                    <Text style={styles.imagePlaceholderText}>
                      Tap to select an image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
              {isEdit && selectedCategory?.image && (
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
  );
}