import axios from 'axios';

const hello_1 = import.meta.env.VITE_API_BASE_URL;
const hello_2 = import.meta.env.VITE_FAST_API_BACKEND;
const hello_3 = import.meta.env.VITE_ORCHESTRA_API_BACKED;

console.log('Hello_1', hello_1);
console.log('Test env:', import.meta.env.VITE_TEST);

console.log('Hello_2', hello_2);
console.log('Hello_3', hello_3);
console.log('All env variables:', import.meta.env);

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
