import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { User } from "../types/user";

interface UserListProps {
  users: User[];
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  onPageChange: (page: number) => void;
  onRoleUpdate: (userId: number, role: 'user' | 'admin') => void;
  onDelete: (user: User) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export default function UserList({
  users,
  currentPage,
  totalPages,
  totalUsers,
  onPageChange,
  onRoleUpdate,
  onDelete,
  onRefresh,
  refreshing,
}: UserListProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleString = (role: number | string): 'user' | 'admin' => {
    if (typeof role === 'number') {
      return role === 1 ? 'admin' : 'user';
    }
    return role as 'user' | 'admin';
  };

  const getRoleDisplay = (role: number | string): string => {
    const roleStr = getRoleString(role);
    return roleStr.charAt(0).toUpperCase() + roleStr.slice(1);
  };

  const getRoleColor = (role: number | string) => {
    const roleStr = getRoleString(role);
    return roleStr === 'admin' ? '#ef4444' : '#3b82f6';
  };

  const getRoleBadgeStyle = (role: number | string) => {
    const roleStr = getRoleString(role);
    const baseStyle = {
      backgroundColor: roleStr === 'admin' ? '#fef2f2' : '#eff6ff',
      borderColor: roleStr === 'admin' ? '#fecaca' : '#dbeafe',
    };
    return baseStyle;
  };

  const handleRoleToggle = (userId: number, currentRole: number | string) => {
    const currentRoleStr = getRoleString(currentRole);
    const newRole = currentRoleStr === 'admin' ? 'user' : 'admin';
    onRoleUpdate(userId, newRole);
  };

  if (users.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Ionicons name="people-outline" size={80} color="#9ca3af" />
        <Text style={styles.emptyStateTitle}>No Users Found</Text>
        <Text style={styles.emptyStateText}>
          When users register, they will appear here for management.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Users Table */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={styles.tableHeader}>
          <View style={[styles.tableCell, styles.headerCell, { flex: 2 }]}>
            <Text style={styles.headerText}>User</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 1.5 }]}>
            <Text style={styles.headerText}>Contact</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
            <Text style={styles.headerText}>Joined</Text>
          </View>
          <View style={[styles.tableCell, styles.headerCell, { flex: 1 }]}>
            <Text style={styles.headerText}>Actions</Text>
          </View>
        </View>

        {/* Table Body */}
        <ScrollView style={styles.tableBody}>
          {users.map((user) => (
            <View key={user.id} style={styles.tableRow}>
              {/* User Info */}
              <View style={[styles.tableCell, { flex: 2 }]}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {user.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                  </View>
                </View>
              </View>

              {/* Contact Info */}
              <View style={[styles.tableCell, { flex: 1.5 }]}>
                <View style={styles.contactInfo}>
                  <Ionicons name="mail-outline" size={14} color="#6b7280" />
                  <Text style={styles.contactText}>{user.email}</Text>
                </View>
                {user.phone && (
                  <View style={styles.contactInfo}>
                    <Ionicons name="call-outline" size={14} color="#6b7280" />
                    <Text style={styles.contactText}>{user.phone}</Text>
                  </View>
                )}
              </View>

              {/* Join Date */}
              <View style={[styles.tableCell, { flex: 1 }]}>
                <Text style={styles.dateText}>{formatDate(user.created_at)}</Text>
              </View>

              {/* Actions */}
              <View style={[styles.tableCell, { flex: 1 }]}>
                <View style={styles.actionButtons}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => onDelete(user)}
                  >
                    <Ionicons name="trash-outline" size={16} color="#ef4444" />
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Pagination */}
      {totalPages > 1 && (
        <View style={styles.pagination}>
          <TouchableOpacity
            style={[styles.paginationButton, !(currentPage > 1) && styles.paginationButtonDisabled]}
            onPress={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <Ionicons name="chevron-back" size={16} color={currentPage > 1 ? "#374151" : "#9ca3af"} />
            <Text style={[styles.paginationText, currentPage <= 1 && styles.paginationTextDisabled]}>
              Previous
            </Text>
          </TouchableOpacity>

          <View style={styles.pageInfo}>
            <Text style={styles.pageText}>
              Page {currentPage} of {totalPages}
            </Text>
            <Text style={styles.totalText}>
              {totalUsers} total users
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.paginationButton, !(currentPage < totalPages) && styles.paginationButtonDisabled]}
            onPress={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <Text style={[styles.paginationText, currentPage >= totalPages && styles.paginationTextDisabled]}>
              Next
            </Text>
            <Ionicons name="chevron-forward" size={16} color={currentPage < totalPages ? "#374151" : "#9ca3af"} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  table: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  tableCell: {
    padding: 16,
    justifyContent: 'center',
  },
  headerCell: {
    paddingVertical: 12,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tableBody: {
    maxHeight: 600,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    color: '#6b7280',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  contactText: {
    fontSize: 12,
    color: '#6b7280',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    alignSelf: 'flex-start',
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 12,
    color: '#6b7280',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    gap: 4,
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  deleteButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  paginationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#d1d5db',
    gap: 8,
  },
  paginationButtonDisabled: {
    opacity: 0.5,
  },
  paginationText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  paginationTextDisabled: {
    color: '#9ca3af',
  },
  pageInfo: {
    alignItems: 'center',
  },
  pageText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  totalText: {
    fontSize: 12,
    color: '#6b7280',
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