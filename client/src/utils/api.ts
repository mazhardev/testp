import axios from 'axios';

const api = axios.create({
baseURL: 'http://localhost:3000', 
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        localStorage.removeItem('userId');
        window.location.href = '/login'; 
        }
        return Promise.reject(error); 
    }
);

export default api;