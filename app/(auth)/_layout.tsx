import { Stack } from 'expo-router';

export default function AuthLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="login" 
        options={{ 
          headerShown: true,
          title: 'Sign In',
          headerBackTitle: 'Back'
        }} 
      />
      <Stack.Screen 
        name="register" 
        options={{ 
          headerShown: true,
          title: 'Create Account',
          headerBackTitle: 'Back'
        }} 
      />
    </Stack>
  );
}