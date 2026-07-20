import axios from 'axios';

const api = axios.create({
  // Gunakan '/api' saat deploy di Vercel, dan localhost saat dev lokal
  baseURL: import.meta.env.PROD ? '/api' : 'http://localhost:5000/api', 
});

// Tambahkan interceptor untuk menyisipkan token otomatis (buat Dashboard Admin)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;