import axios from 'axios';

// ════════════════════════════════════════
//  INSTANCE AXIOS
// ════════════════════════════════════════
const api = axios.create({
  baseURL: 'http://localhost:3001',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000
});

// ════════════════════════════════════════
//  REQUEST INTERCEPTOR
// ════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    const user = localStorage.getItem('user');
    if (user) {
      config.headers['X-User'] = JSON.parse(user).username;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ════════════════════════════════════════
//  RESPONSE INTERCEPTOR
// ════════════════════════════════════════
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      console.error('⛔ Timeout');
    }
    if (error.code === 'ERR_NETWORK') {
      console.error('⛔ Serveur API hors ligne');
    }
    return Promise.reject(error);
  }
);

export default api;