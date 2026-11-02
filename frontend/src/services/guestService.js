import api from './api';

export const guestService = {
  // Dining & Room Service
  getDiningMenu: async (category) => {
    const params = category && category !== 'ALL' ? { category } : {};
    const response = await api.get('/api/dining/menu', { params });
    return response.data.data;
  },

  createOrder: async (orderPayload) => {
    const response = await api.post('/api/orders', orderPayload);
    return response.data.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/api/orders/my');
    return response.data.data;
  },

  // Housekeeping & Guest Services
  createServiceRequest: async (requestPayload) => {
    const response = await api.post('/api/service-requests', requestPayload);
    return response.data.data;
  },

  getMyServiceRequests: async () => {
    const response = await api.get('/api/service-requests/my');
    return response.data.data;
  },

  // Facility Maintenance
  createMaintenanceTicket: async (ticketPayload) => {
    const response = await api.post('/api/maintenance/tickets', ticketPayload);
    return response.data.data;
  }
};
