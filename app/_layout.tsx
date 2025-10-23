import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="product/[id]" 
          options={{ 
            headerShown: true,
            title: 'Product Details'
          }} 
        />
        <Stack.Screen 
          name="checkout" 
          options={{ 
            headerShown: true,
            title: 'Checkout',
            presentation: 'modal'
          }} 
        />
        <Stack.Screen 
          name="orders" 
          options={{ 
            headerShown: true,
            title: 'My Orders'
          }} 
        />
        <Stack.Screen 
          name="order-tracking/[id]" 
          options={{ 
            headerShown: true,
            title: 'Order Tracking'
          }} 
        />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}