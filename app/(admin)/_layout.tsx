import { useAuth } from '@/api/use-auth';
import { Redirect, Stack } from 'expo-router';
import { Platform } from 'react-native';

export default function AdminLayout() {
  const { isAuthenticated } = useAuth();

  if (Platform.OS !== 'web') {
    return <Redirect href="/(auth)/login" />;
  }

  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="login" />
      </Stack>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}