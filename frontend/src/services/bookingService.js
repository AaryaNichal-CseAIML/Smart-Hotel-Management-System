import api from './api';

export const bookingService = {
  async checkAvailability(query) {
    const res = await api.post('/bookings/availability', query);
    return res.data.data;
  },

  async createReservation(bookingData) {
    const res = await api.post('/bookings', bookingData);
    return res.data.data;
  },

  async getMyBookings() {
    const res = await api.get('/bookings/my');
    return res.data.data;
  },

  async getBookingByReference(reference) {
    const res = await api.get(`/bookings/${reference}`);
    return res.data.data;
  },

  async cancelBooking(bookingId, cancelData = {}) {
    const res = await api.post(`/bookings/${bookingId}/cancel`, cancelData);
    return res.data.data;
  },
};
