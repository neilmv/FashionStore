import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

export const API_URL = 'http://your-ip-address:5000/api';

export const API = axios.create({
  baseURL: API_URL,
});

API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error('Error getting token from storage:', error);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.message);
    return Promise.reject(error);
  }
);