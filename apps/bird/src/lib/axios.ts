import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const fastApiInstance = axios.create({
  baseURL: import.meta.env.VITE_FAST_API_BACKEND,
});

export { axiosInstance, fastApiInstance };

export default axiosInstance;
