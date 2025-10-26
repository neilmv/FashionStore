import { useAuth } from '@/api/use-auth';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export function useAuthGuard() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (Platform.OS !== 'web') {
      router.replace('/(auth)/login');
      return;
    }

    if (isAuthenticated === false) {
      router.replace('/(admin)/login');
    }
  }, [isAuthenticated, router]);

  return { isAuthenticated };
}