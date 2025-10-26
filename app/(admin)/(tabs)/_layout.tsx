import { useAuth } from "@/api/use-auth";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DrawerItemList } from "@react-navigation/drawer";
import { useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

function CustomDrawerContent(props: any) {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
    router.replace("/(admin)/login");
  };

  return (
    <View style={styles.drawerContainer}>
      {/* Header Section */}
      <View style={styles.drawerHeader}>
        <View style={styles.logoContainer}>
          <Ionicons name="shield-checkmark" size={32} color="#3b82f6" />
          <Text style={styles.logoText}>Admin Panel</Text>
        </View>
        <Text style={styles.welcomeText}>Welcome back!</Text>
      </View>

      {/* Navigation Items */}
      <View style={styles.navSection}>
        <DrawerItemList {...props} />
      </View>

      {/* Footer with Logout */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.footerInfo}>
          <Text style={styles.footerText}>Fashion Store Admin</Text>
          <Text style={styles.footerVersion}>v1.0.0</Text>
        </View>
      </View>
    </View>
  );
}

export default function AdminTabsLayout() {
  if (Platform.OS !== "web") {
    return null;
  }

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        drawerType: "permanent",
        headerShown: true,
        drawerStyle: {
          backgroundColor: "#0f172a",
          width: 320,
        },
        drawerLabelStyle: {
          color: "#e2e8f0",
          fontSize: 15,
          fontWeight: "500",
          marginLeft: -16,
        },
        drawerActiveTintColor: "#3b82f6",
        drawerInactiveTintColor: "#94a3b8",
        drawerActiveBackgroundColor: "rgba(59, 130, 246, 0.1)",
        headerStyle: {
          backgroundColor: "#1e293b",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 4,
        },
        headerTintColor: "#f8fafc",
        headerTitleStyle: {
          fontWeight: "600",
          fontSize: 18,
        },
      }}
    >
      <Drawer.Screen
        name="dashboard"
        options={{
          title: "Dashboard Overview",
          drawerLabel: "Dashboard",
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="speedometer" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="categories"
        options={{
          title: "Category Management",
          drawerLabel: "Categories",
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="list" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="products"
        options={{
          title: "Product Catalog",
          drawerLabel: "Product Catalog",
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="shirt" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="orders"
        options={{
          title: "Order Management",
          drawerLabel: "Orders & Sales",
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="cart" size={size} color={color} />
            </View>
          ),
        }}
      />
      <Drawer.Screen
        name="users"
        options={{
          title: "User Management",
          drawerLabel: "User Management",
          drawerIcon: ({ color, size }) => (
            <View style={styles.iconContainer}>
              <Ionicons name="people" size={size} color={color} />
            </View>
          ),
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  drawerHeader: {
    padding: 24,
    paddingTop: 48,
    borderBottomWidth: 1,
    borderBottomColor: "#1e293b",
    backgroundColor: "rgba(30, 41, 59, 0.5)",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#f8fafc",
    marginLeft: 12,
  },
  welcomeText: {
    fontSize: 14,
    color: "#94a3b8",
    fontWeight: "500",
  },
  navSection: {
    flex: 1,
    paddingVertical: 16,
  },
  drawerFooter: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#1e293b",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.2)",
    marginBottom: 20,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "600",
    marginLeft: 12,
  },
  footerInfo: {
    alignItems: "center",
  },
  footerText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  footerVersion: {
    color: "#475569",
    fontSize: 11,
  },
  iconContainer: {
    width: 32,
    alignItems: "center",
    marginRight: 12,
  },
});
