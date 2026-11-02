import api from './api';

export const billingService = {
  getFolioStatement: async (bookingId) => {
    const response = await api.get(`/api/billing/folios/${bookingId}`);
    return response.data.data;
  },

  processPayment: async (bookingId, paymentPayload) => {
    const response = await api.post(`/api/billing/folios/${bookingId}/payments`, paymentPayload);
    return response.data.data;
  },

  processRefund: async (refundPayload) => {
    const response = await api.post('/api/billing/refunds', refundPayload);
    return response.data.data;
  }
};
