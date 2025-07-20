import axios from 'axios';

// Determine the base URL based on the environment
const productionUrl = 'https://college-system-sq7j.onrender.com/api'; // ✅ Your deployed backend URL

const instance = axios.create({
    baseURL: process.env.NODE_ENV === 'production' ? productionUrl : '/api'
});

// Add a request interceptor to automatically attach the token to every request
instance.interceptors.request.use(config => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export default instance;
