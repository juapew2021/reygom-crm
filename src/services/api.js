import axios from 'axios';

const api = axios.create({
  withCredentials: true,
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

api.interceptors.response.use(response => response, error => {
  const code = error.response?.data?.code;
  if (['ACCESS_APPROVAL_REQUIRED','ACCESS_LOGIN_REQUIRED'].includes(code) && error.config?.url !== '/login') {
    sessionStorage.setItem('accessNotice', error.response.data.message);
    localStorage.clear(); window.location.assign('/');
  }
  return Promise.reject(error);
});
export default api;