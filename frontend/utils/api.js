import axios from 'axios';

const api = axios.create({
  // Sesuaikan dengan port backend kamu (biasanya 5000)
  baseURL: 'http://localhost:5000/api', 
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