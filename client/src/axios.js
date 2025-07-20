import axios from 'axios';

// Create a central axios instance
const instance = axios.create({
    // The baseURL will now be handled by the proxy, so we can use relative paths.
    // We only need to specify the common part of our API routes.
    baseURL: '/api' 
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
