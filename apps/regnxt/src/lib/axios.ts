import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const birdBackendInstance = axios.create({
  baseURL: import.meta.env.VITE_FAST_API_BACKEND,
});

const orchestraBackendInstance = axios.create({
  baseURL: import.meta.env.VITE_ORCHESTRA_API_BACKED,
});

export {axiosInstance, birdBackendInstance, orchestraBackendInstance};

export default axiosInstance;
