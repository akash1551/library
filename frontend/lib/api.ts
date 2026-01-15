import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // Standardize error handling
    if (error.response && error.response.data) {
      // Backend sent a formatted error message
      return Promise.reject(error.response.data);
    }
    return Promise.reject({
      status: 'error',
      message: 'Network error or server unreachable',
    });
  }
);

export default api;