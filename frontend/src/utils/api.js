import axios from 'axios';

const api = axios.create({
    // Alamat Backend kamu
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Interceptor: Otomatis masukin Token ke setiap request kalau user sudah login
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