import { ReactNode } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface SectionCardProps {
  title: string;
  onViewAll?: () => void;
  viewAllText?: string;
  children: ReactNode;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  onViewAll,
  viewAllText = 'View All',
  children,
}) => (
  <View style={styles.card}>
    <View style={styles.header}>
      <Text style={styles.title}>{title}</Text>
      {onViewAll && (
        <TouchableOpacity onPress={onViewAll}>
          <Text style={styles.viewAllText}>{viewAllText}</Text>
        </TouchableOpacity>
      )}
    </View>
    <View style={styles.content}>{children}</View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllText: {
    color: '#3b82f6',
    fontWeight: '600',
    fontSize: 14,
  },
  content: {
    gap: 16,
  },
});