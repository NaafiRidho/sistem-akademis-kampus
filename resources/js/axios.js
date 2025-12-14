import axios from 'axios';

// Get token from localStorage
const token = localStorage.getItem('jwt_token');

// Set default headers
if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add request interceptor to refresh token if needed
axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If token expired, try to refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const response = await axios.post('/refresh');
                const newToken = response.data.token;

                localStorage.setItem('jwt_token', newToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

                return axios(originalRequest);
            } catch (refreshError) {
                // Refresh failed, redirect to login
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default axios;
