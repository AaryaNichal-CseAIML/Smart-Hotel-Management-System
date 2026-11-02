import api from './api';

export const hotelService = {
  async getHotelInfo() {
    const res = await api.get('/public/info');
    return res.data.data;
  },

  async getRoomTypes() {
    const res = await api.get('/rooms');
    return res.data.data;
  },
};
