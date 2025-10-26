import { BASE_API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/categoryStyles";
import { Category } from "../types/category";


interface CategoryListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function CategoryList({ 
  categories, 
  onEdit, 
  onDelete, 
  onRefresh, 
  refreshing 
}: CategoryListProps) {
  if (categories.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="folder-open-outline" size={64} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No Categories Found</Text>
        <Text style={styles.emptyStateText}>
          Get started by creating your first product category.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.categoriesGrid}>
        {categories.map((category) => (
          <View key={category.id} style={styles.categoryCard}>
            <View style={styles.categoryImageContainer}>
              {category.image ? (
                <Image
                  source={{
                    uri: `${BASE_API}${category.image}`,
                  }}
                  style={styles.categoryImage}
                />
              ) : (
                <View style={styles.categoryImagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#9ca3af" />
                </View>
              )}
            </View>

            <View style={styles.categoryContent}>
              <Text style={styles.categoryName} numberOfLines={1}>
                {category.name}
              </Text>
              {category.description && (
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description}
                </Text>
              )}
              <Text style={styles.categoryMeta}>
                Created {new Date(category.created_at).toLocaleDateString()}
              </Text>
            </View>

            <View style={styles.categoryActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(category)}
              >
                <Ionicons name="create-outline" size={18} color="#3b82f6" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(category)}
              >
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}