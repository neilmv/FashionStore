import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  borderColor: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  color,
  borderColor,
}) => (
  <View style={[styles.card, { borderLeftColor: borderColor }]}>
    <View style={styles.iconContainer}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <View style={styles.content}>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{title}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 220,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  content: {
    flex: 1,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  label: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
});