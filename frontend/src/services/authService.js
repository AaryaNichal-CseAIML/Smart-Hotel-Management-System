import api from './api';

export const authService = {
  async login(credentials) {
    const res = await api.post('/auth/login', credentials);
    return res.data.data;
  },

  async register(userData) {
    const res = await api.post('/auth/register', userData);
    return res.data.data;
  },

  async logout() {
    const res = await api.post('/auth/logout');
    return res.data.data;
  },

  async getMe() {
    const res = await api.get('/auth/me');
    return res.data.data;
  },
};
