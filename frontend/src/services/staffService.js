import api from './api';

export const staffService = {
  // Operational KPIs
  getDashboardSummary: async () => {
    const response = await api.get('/api/staff/dashboard-summary');
    return response.data.data;
  },

  // Rooms & Housekeeping
  getRoomsInventory: async (filters = {}) => {
    const response = await api.get('/api/staff/rooms', { params: filters });
    return response.data.data;
  },

  updateRoomOperationalStatus: async (id, operationalStatus) => {
    const response = await api.patch(`/api/staff/rooms/${id}/status`, { operationalStatus });
    return response.data.data;
  },

  // Front Desk Check-In & Check-Out
  getAllStaffBookings: async (status = null) => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get('/api/staff/bookings', { params });
    return response.data.data;
  },

  checkInBooking: async (bookingId, allocations) => {
    const response = await api.post(`/api/staff/bookings/${bookingId}/check-in`, { allocations });
    return response.data.data;
  },

  checkOutBooking: async (bookingId) => {
    const response = await api.post(`/api/staff/bookings/${bookingId}/check-out`);
    return response.data.data;
  },

  // Kitchen & Room Service
  getStaffOrders: async (status = null) => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get('/api/orders', { params });
    return response.data.data;
  },

  updateOrderStatus: async (orderId, status) => {
    const response = await api.patch(`/api/orders/${orderId}/status`, { status });
    return response.data.data;
  },

  // Butler & Housekeeping Requests
  getStaffServiceRequests: async (status = null, category = null) => {
    const params = {};
    if (status && status !== 'ALL') params.status = status;
    if (category && category !== 'ALL') params.category = category;
    const response = await api.get('/api/service-requests', { params });
    return response.data.data;
  },

  updateServiceRequestStatus: async (id, status, assignedStaffId = null) => {
    const response = await api.patch(`/api/service-requests/${id}`, { status, assignedStaffId });
    return response.data.data;
  },

  // Maintenance & Engineering
  getStaffMaintenanceTickets: async (status = null) => {
    const params = status && status !== 'ALL' ? { status } : {};
    const response = await api.get('/api/maintenance/tickets', { params });
    return response.data.data;
  },

  updateMaintenanceTicket: async (id, status, assignedStaffId = null, resolutionNotes = null) => {
    const response = await api.patch(`/api/maintenance/tickets/${id}`, {
      status,
      assignedStaffId,
      resolutionNotes
    });
    return response.data.data;
  },

  // Management Reporting & Analytics
  getManagementAnalytics: async () => {
    const response = await api.get('/api/staff/analytics');
    return response.data.data;
  }
};
