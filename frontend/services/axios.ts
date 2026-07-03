import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user && user.NIK) {
        config.headers['x-user-nik'] = user.NIK;
      }
    } catch (e) {
      console.error('Failed to parse user session in Axios interceptor:', e);
    }
  }
  return config;
});

export default api;
