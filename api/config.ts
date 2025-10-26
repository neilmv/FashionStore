import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

export const API_URL = "http://ip_address:5000/api";
export const BASE_API = "http://ip_address:5000";

export const API = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

API.interceptors.request.use(async (config) => {
  try {
    const token = await AsyncStorage.getItem("userToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error getting token from storage:", error);
  }
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      AsyncStorage.removeItem("userToken");
      AsyncStorage.removeItem("userData");
    }
    return Promise.reject(error);
  }
);
