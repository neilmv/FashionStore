import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  onPress: () => void;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Quick Actions</Text>
    <View style={styles.grid}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={action.onPress}
        >
          <Ionicons name={action.icon} size={32} color={action.color} />
          <Text style={styles.actionText}>{action.title}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  grid: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  actionText: {
    marginTop: 12,
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
});