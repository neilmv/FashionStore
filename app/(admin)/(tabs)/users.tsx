import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import { useAuth } from "@/api/use-auth";
import UserList from "../users/components/UserList";
import { useUsers } from "../users/hooks/useUsers";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerContent: {
    flex: 1,
    maxWidth: 1200,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginHorizontal: "auto",
    width: "100%",
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1f2937",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: 300,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#374151",
    marginLeft: 8,
  },
  refreshButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  statsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 24,
    marginLeft: 24,
    paddingLeft: 24,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1f2937",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 24,
    maxWidth: 1200,
    marginHorizontal: "auto",
    width: "100%",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8fafc",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
});

export default function UsersScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const {
    users,
    loading,
    refreshing,
    searchQuery,
    currentPage,
    totalPages,
    totalUsers,
    fetchUsers,
    handleRefresh,
    handleSearch,
    handlePageChange,
    updateUserRole,
    deleteUser,
    initializeData,
  } = useUsers();

  const [localSearch, setLocalSearch] = useState("");

  const regularUsers = users.filter(user => {
    const role = typeof user.role === "number" ? user.role : user.role;
    return role === 0 || role === 'user';
  });

  useEffect(() => {
    if (Platform.OS !== "web") {
      router.replace("/(auth)/login");
      return;
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated === false) {
      router.replace("/(admin)/login");
      return;
    }

    if (isAuthenticated) {
      initializeData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      handleSearch(localSearch);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [localSearch]);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Checking authentication...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (loading && users.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading Users...</Text>
      </View>
    );
  }

  const userStats = {
    total: regularUsers.length,
    active: regularUsers.length,
  };

  return (
    <View style={styles.container}>
      {/* Enhanced Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>User Management</Text>
            <Text style={styles.subtitle}>
              Manage regular users and their permissions
            </Text>
          </View>

          <View style={styles.headerActions}>
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#9ca3af" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users by name or email..."
                value={localSearch}
                onChangeText={setLocalSearch}
                clearButtonMode="while-editing"
              />
            </View>

            {/* User Statistics */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{userStats.total}</Text>
                <Text style={styles.statLabel}>Total Users</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statValue, { color: "#10b981" }]}>
                  {userStats.active}
                </Text>
                <Text style={styles.statLabel}>Showing</Text>
              </View>
            </View>

            {/* Refresh Button */}
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleRefresh}
              disabled={refreshing}
            >
              <Ionicons
                name="refresh"
                size={20}
                color={refreshing ? "#9ca3af" : "#3b82f6"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <UserList
          users={regularUsers}
          currentPage={currentPage}
          totalPages={totalPages}
          totalUsers={userStats.total}
          onPageChange={handlePageChange}
          onRoleUpdate={updateUserRole}
          onDelete={deleteUser}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />
      </View>
    </View>
  );
}