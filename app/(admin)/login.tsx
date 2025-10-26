import { API } from '@/api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AdminLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (Platform.OS !== 'web') {
    router.replace('/(auth)/login');
    return null;
  }

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const response = await API.post('/auth/login', { email, password });
      
      if (response.data.user.role !== 1) {
        Alert.alert('Error', 'Admin access required');
        return;
      }
      
      await AsyncStorage.setItem('userToken', response.data.token);
      await AsyncStorage.setItem('userData', JSON.stringify(response.data.user));
      
      Alert.alert('Success', 'Admin login successful!');
      router.replace('/(admin)/(tabs)/dashboard');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginCard}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Admin Portal</Text>
          <Text style={styles.subtitle}>Sign in to your admin account</Text>
        </View>

        {/* Login Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="password"
            />
          </View>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            <Text style={styles.loginButtonText}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Text>
          </TouchableOpacity>

          {/* Security Notice */}
          <View style={styles.securityNotice}>
            <Text style={styles.securityText}>
              🔒 This portal is for authorized administrators only.
            </Text>
          </View>
        </View>
      </View>

      {/* Background Decoration */}
      <View style={styles.backgroundShape1} />
      <View style={styles.backgroundShape2} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginCard: {
    backgroundColor: '#ffffff',
    padding: 40,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4a5568',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  loginButton: {
    backgroundColor: '#3182ce',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#3182ce',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonDisabled: {
    backgroundColor: '#a0aec0',
    shadowColor: '#a0aec0',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  securityNotice: {
    backgroundColor: '#edf2f7',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3182ce',
    marginTop: 16,
  },
  securityText: {
    color: '#4a5568',
    fontSize: 14,
    textAlign: 'center',
  },
  backgroundShape1: {
    position: 'absolute',
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    backgroundColor: '#3182ce',
    opacity: 0.05,
    borderRadius: 150,
    zIndex: -1,
  },
  backgroundShape2: {
    position: 'absolute',
    bottom: -100,
    left: -100,
    width: 250,
    height: 250,
    backgroundColor: '#3182ce',
    opacity: 0.05,
    borderRadius: 125,
    zIndex: -1,
  },
});