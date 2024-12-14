import { jwtDecode } from "jwt-decode";
import axiosInstance from "./axios";

export interface User {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isConfirmed: boolean;
  isApproved: boolean;
}

export interface AuthResponse extends User {
  jwtToken: string;
}

interface DecodedToken {
  id: string;
  email: string;
  role: string;
  exp: number;
}

let refreshTokenPromise: Promise<string> | null = null;

export async function login(email: string, password: string): Promise<User> {
  const response = await axiosInstance.post<AuthResponse>(
    "/accounts/authenticate",
    { email, password }
  );
  const { jwtToken, ...user } = response.data;
  localStorage.setItem("token", jwtToken);
  return user;
}

export function logout() {
  localStorage.removeItem("token");
}

export async function refreshToken(): Promise<string> {
  if (!refreshTokenPromise) {
    refreshTokenPromise = axiosInstance
      .post<AuthResponse>("/accounts/refresh-token")
      .then((response) => {
        const { jwtToken } = response.data;
        localStorage.setItem("token", jwtToken);
        return jwtToken;
      })
      .catch((error) => {
        console.error("Error refreshing token:", error);
        logout();
        throw error;
      })
      .finally(() => {
        refreshTokenPromise = null;
      });
  }
  return refreshTokenPromise;
}

export async function getUser(): Promise<User | null> {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    if (decodedToken.exp * 1000 <= Date.now()) {
      await refreshToken();
    }
    return await fetchUserDetails(decodedToken.id);
  } catch (error) {
    console.error("Error decoding token or fetching user details:", error);
    localStorage.removeItem("token");
    return null;
  }
}

async function fetchUserDetails(userId: string): Promise<User | null> {
  try {
    const response = await axiosInstance.get<User>(`/accounts/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user details:", error);
    return null;
  }
}

export function isTokenValid(): boolean {
  const token = localStorage.getItem("token");
  if (!token) return false;

  try {
    const decodedToken = jwtDecode<DecodedToken>(token);
    return decodedToken.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

// Modify axios instance to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const newToken = await refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error(
          "Error refreshing token in response interceptor:",
          refreshError
        );
        logout();
        throw refreshError;
      }
    }
    return Promise.reject(error);
  }
);
