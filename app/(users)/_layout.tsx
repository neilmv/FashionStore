import { useAuth } from "@/api/use-auth";
import { Redirect, Stack } from "expo-router";

export default function UsersLayout() {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="product/[id]"
        options={{
          headerShown: true,
          title: "Product Details",
        }}
      />
      <Stack.Screen
        name="checkout"
        options={{
          headerShown: true,
          title: "Checkout",
          presentation: "modal",
        }}
      />
      <Stack.Screen
        name="orders"
        options={{
          headerShown: true,
          title: "My Orders",
        }}
      />
      <Stack.Screen
        name="order-tracking/[id]"
        options={{
          headerShown: true,
          title: "Order Tracking",
        }}
      />
    </Stack>
  );
}
