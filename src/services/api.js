import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const office = localStorage.getItem('officeId');
  if (token && office && config.url !== '/login') config.headers['X-Office-Id'] = office;
  return config;
});

export default api;