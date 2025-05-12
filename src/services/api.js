import axios from 'axios';
import Cookies from 'js-cookie';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true, // Important if your backend sets HttpOnly cookies (though we're setting them client-side here)
});

// Request interceptor to add the auth token from cookies to headers
apiClient.interceptors.request.use(
    (config) => {
        const token = Cookies.get('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Auth API calls
export const registerUserApi = (userData) => apiClient.post('/register', userData);
export const loginUserApi = (credentials) => apiClient.post('/login', credentials);
export const logoutUserApi = () => apiClient.post('/logout');

// User Profile API calls
export const getUserProfileApi = () => apiClient.get('/profile');
export const updateUserProfileApi = (userData) => apiClient.put('/profile', userData);
export const deleteUserProfileApi = () => apiClient.delete('/profile');

export default apiClient;