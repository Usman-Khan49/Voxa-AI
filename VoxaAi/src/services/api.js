import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { getApiBaseUrl } from "../config/apiConfig";

// Use centralized API configuration (supports both local and ngrok)
const API_URL = `${getApiBaseUrl()}/api`;

console.log(`[API] Using API URL: ${API_URL} (Platform: ${Platform.OS})`);

const TOKEN_KEY = "voxa_auth_token";

// Helper to get token based on platform
const getToken = async () => {
  if (Platform.OS === "web") {
    return localStorage.getItem(TOKEN_KEY);
  }
  return await SecureStore.getItemAsync(TOKEN_KEY);
};

// Helper to set token based on platform
const setToken = async (token) => {
  if (Platform.OS === "web") {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  }
};

// Helper to remove token based on platform
const removeToken = async () => {
  if (Platform.OS === "web") {
    localStorage.removeItem(TOKEN_KEY);
  } else {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // Increased to 30 seconds
});

// Add token to requests
api.interceptors.request.use(
  async (config) => {
    try {
      console.log(
        `[API] Making ${config.method.toUpperCase()} request to: ${config.url}`
      );
      const token = await getToken();
      if (token) {
        console.log("[API] Token found, attaching to request");
        config.headers.Authorization = `Bearer ${token}`;
      } else {
        console.log("[API] No token found");
      }
    } catch (error) {
      console.warn("Token retrieval error:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  register: async (username, email, password) => {
    try {
      // Backend expects: { email, password, name? }
      const response = await api.post("/auth/register", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
      throw error.response?.data || { error: "Registration failed" };
    }
  },

  // Login user
  login: async (email, password) => {
    try {
      console.log(`[API] Attempting login to: ${API_URL}/auth/login`);
      const response = await api.post("/auth/login", {
        email,
        password,
      });

      // Save token if present
      if (response.data.token) {
        try {
          await setToken(response.data.token);
        } catch (storeError) {
          console.warn("Token save error:", storeError);
        }
      }

      return response.data;
    } catch (error) {
      console.error("Login error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
      });
      throw error.response?.data || { error: "Login failed" };
    }
  },

  // Logout
  logout: async () => {
    try {
      await removeToken();
    } catch (error) {
      console.warn("Logout error:", error);
    }
  },

  // Check if user is logged in
  isLoggedIn: async () => {
    const token = await getToken();
    return !!token;
  },

  // Update user profile
  updateProfile: async (data) => {
    try {
      console.log(`[API] Updating profile at: ${API_URL}/auth/profile`);
      const isFormData = data instanceof FormData;
      console.log(`[API] Is FormData: ${isFormData}`);

      // Use native fetch for FormData (works better on React Native)
      if (isFormData) {
        console.log("[API] Using fetch for FormData upload");
        const token = await getToken();

        const response = await fetch(`${API_URL}/auth/profile`, {
          method: "PUT",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: data,
        });

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Profile update failed" }));
          console.error("Profile update failed:", errorData);
          throw errorData;
        }

        console.log("[API] Profile update successful");
        return await response.json();
      }

      // Use axios for JSON data
      console.log("[API] Sending profile update request (JSON)...");
      const response = await api.put("/auth/profile", data, { timeout: 30000 });
      console.log("[API] Profile update successful");
      return response.data;
    } catch (error) {
      console.error("Profile update error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        url: `${API_URL}/auth/profile`,
      });
      throw (
        error.response?.data ||
        error.error || { error: "Profile update failed" }
      );
    }
  },

  // Save new recording
  saveRecording: async (data) => {
    try {
      console.log(`[API] Saving recording to: ${API_URL}/recordings`);
      const isFormData = data instanceof FormData;
      console.log(`[API] Is FormData: ${isFormData}`);

      // Use native fetch for FormData (works better on React Native)
      if (isFormData) {
        console.log(
          "[API] Using fetch for FormData upload (with extended timeout for AI processing)"
        );
        const token = await getToken();

        // Create timeout promise
        const timeout = new Promise(
          (_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error("Request timeout - AI processing taking too long")
                ),
              180000
            ) // 3 minutes
        );

        // Create fetch promise
        const fetchPromise = fetch(`${API_URL}/recordings`, {
          method: "POST",
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: data,
        });

        // Race between fetch and timeout
        const response = await Promise.race([fetchPromise, timeout]);

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ error: "Failed to save recording" }));
          console.error("Recording save failed:", errorData);
          throw errorData;
        }

        console.log("[API] Recording saved successfully");
        return await response.json();
      }

      // Use axios for JSON data
      console.log("[API] Sending recording save request (JSON)...");
      const response = await api.post("/recordings", data, {
        timeout: 180000, // 3 minutes for AI processing (transcription + improvement + voice cloning)
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
      });
      console.log("[API] Recording saved successfully");
      return response.data;
    } catch (error) {
      console.error("Save recording error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        code: error.code,
        url: `${API_URL}/recordings`,
      });
      throw (
        error.response?.data ||
        error.error || { error: "Failed to save recording" }
      );
    }
  },

  // Get all recordings
  getRecordings: async () => {
    try {
      const response = await api.get("/recordings");
      return response.data;
    } catch (error) {
      console.error(
        "Fetch recordings error:",
        error.response?.data || error.message
      );
      throw error.response?.data || { error: "Failed to fetch recordings" };
    }
  },

  // Get recording processing progress
  getRecordingProgress: async (recordingId) => {
    try {
      const response = await api.get(`/recordings/${recordingId}/progress`);
      return response.data;
    } catch (error) {
      console.error(
        "Get progress error:",
        error.response?.data || error.message
      );
      return { status: "unknown", stage: "Unknown", progress: 0 };
    }
  },

  // Get current user profile
  getCurrentUser: async () => {
    try {
      const response = await api.get("/auth/verify");
      return response.data.user;
    } catch (error) {
      console.error("Get user error:", error.response?.data || error.message);
      throw error.response?.data || { error: "Failed to get user data" };
    }
  },

  // Get current token
  getToken: async () => {
    return await getToken();
  },
};

export default api;
