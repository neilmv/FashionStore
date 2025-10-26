import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { Product } from '../types/types';

interface ProductItemProps {
  product: Product;
}

export const ProductItem: React.FC<ProductItemProps> = ({ product }) => (
  <View style={styles.container}>
    <View>
      <Text style={styles.name}>{product.name}</Text>
      <Text style={styles.stockInfo}>
        Stock: <Text style={styles.lowStock}>{product.stock_quantity}</Text>
      </Text>
    </View>
    <View style={styles.warning}>
      <Ionicons name="warning" size={16} color="#f59e0b" />
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  stockInfo: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  lowStock: {
    color: '#ef4444',
    fontWeight: '600',
  },
  warning: {
    padding: 4,
  },
});