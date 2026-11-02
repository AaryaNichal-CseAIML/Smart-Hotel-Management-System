import api from './api';

export const intelligenceService = {
  getRecommendations: async (inquiryData) => {
    const response = await api.post('/api/intelligence/recommendations', inquiryData);
    return response.data.data;
  },

  getDemandForecast: async () => {
    const response = await api.get('/api/intelligence/demand-forecast');
    return response.data.data;
  }
};
