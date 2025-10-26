import { BASE_API } from "@/api/config";
import { Ionicons } from "@expo/vector-icons";
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Product } from "../types/product";

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

const { width } = Dimensions.get('window');

export default function ProductList({ 
  products, 
  onEdit, 
  onDelete, 
  onRefresh, 
  refreshing 
}: ProductListProps) {
  const getGridColumns = () => {
    if (width > 1400) return 4;
    if (width > 1024) return 3;
    if (width > 768) return 2;
    return 1;
  };

  const gridColumns = getGridColumns();

  if (products.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="shirt-outline" size={80} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No Products Found</Text>
        <Text style={styles.emptyStateText}>
          Get started by creating your first product to build your catalog.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={[styles.productsGrid, { gap: 20 }]}>
        {products.map((product) => (
          <View key={product.id} style={[styles.productCard, { width: `${100 / gridColumns - 2}%` }]}>
            {/* Product Image Section */}
            <View style={styles.productImageContainer}>
              {product.image ? (
                <Image
                  source={{
                    uri: `${BASE_API}${product.image}`,
                  }}
                  style={styles.productImage}
                />
              ) : (
                <View style={styles.productImagePlaceholder}>
                  <Ionicons name="image-outline" size={40} color="#9ca3af" />
                  <Text style={styles.imagePlaceholderText}>No Image</Text>
                </View>
              )}
              
              {/* Featured Badge */}
              {product.is_featured && (
                <View style={styles.featuredBadge}>
                  <Ionicons name="star" size={14} color="#fff" />
                  <Text style={styles.featuredText}>Featured</Text>
                </View>
              )}
            </View>

            {/* Product Info Section */}
            <View style={styles.productContent}>
              <Text style={styles.productName} numberOfLines={2}>
                {product.name}
              </Text>
              
              {product.brand && (
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}

              {/* Price Section */}
              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>${product.price}</Text>
                {product.original_price && product.original_price > product.price && (
                  <Text style={styles.originalPrice}>${product.original_price}</Text>
                )}
              </View>

              {/* Stock and Category Info */}
              <View style={styles.infoRow}>
                <View style={[styles.infoBadge, product.stock_quantity > 10 ? styles.inStockBadge : styles.lowStockBadge]}>
                  <Ionicons 
                    name={product.stock_quantity > 10 ? "checkmark-circle" : "warning"} 
                    size={12} 
                    color="#fff" 
                  />
                  <Text style={styles.stockText}>
                    {product.stock_quantity > 10 ? 'In Stock' : `Low: ${product.stock_quantity}`}
                  </Text>
                </View>
                
                {product.category_name && (
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{product.category_name}</Text>
                  </View>
                )}
              </View>

              {/* Additional Info */}
              <View style={styles.additionalInfo}>
                {(product.size || product.color) && (
                  <Text style={styles.variantText} numberOfLines={1}>
                    {[product.size, product.color].filter(Boolean).join(' • ')}
                  </Text>
                )}
                
                <Text style={styles.productMeta}>
                  Added {new Date(product.created_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </Text>
              </View>

              {/* Action Buttons - ALWAYS VISIBLE */}
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.editButton]}
                  onPress={() => onEdit(product)}
                >
                  <Ionicons name="create-outline" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.actionButton, styles.deleteButton]}
                  onPress={() => onDelete(product)}
                >
                  <Ionicons name="trash-outline" size={16} color="#fff" />
                  <Text style={styles.actionButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    padding: 20,
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f1f5f9',
    minWidth: 280,
  },
  productImageContainer: {
    position: 'relative',
    height: 200,
    backgroundColor: '#f8fafc',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: '#9ca3af',
    fontWeight: '500',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.95)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  featuredText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  productContent: {
    padding: 16,
  },
  productName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 6,
    lineHeight: 20,
  },
  productBrand: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
    fontWeight: '500',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
  },
  originalPrice: {
    fontSize: 14,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    fontWeight: '500',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  infoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  inStockBadge: {
    backgroundColor: '#10b981',
  },
  lowStockBadge: {
    backgroundColor: '#f59e0b',
  },
  stockText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  categoryBadge: {
    backgroundColor: '#eff6ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryText: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '600',
  },
  additionalInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    paddingTop: 12,
    marginBottom: 12,
  },
  variantText: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 6,
    fontWeight: '500',
  },
  productMeta: {
    fontSize: 11,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 60,
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    margin: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#374151',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 400,
  },
});