/**
 * Axios API configuration and interceptors
 * Centralizes all API calls and handles authentication
 */

import axios from 'axios';
import toast from 'react-hot-toast';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong';
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('You do not have permission to perform this action.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh')
};

// Admin API calls
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard/stats'),
  getStaff: () => api.get('/admin/staff'),
  createStaff: (data) => api.post('/admin/staff', data),
  updateStaff: (id, data) => api.put(`/admin/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/admin/staff/${id}`),
  getRooms: () => api.get('/admin/rooms'),
  getRoomTypes: () => api.get('/admin/room-types'),
  getDesignations: () => api.get('/admin/designations'),
  getBranches: () => api.get('/admin/branches'),
  // Report API calls
  getRoomOccupancyReport: (params) => api.get('/admin/reports/room-occupancy', { params }),
  getGuestBillingSummary: (params) => api.get('/admin/reports/guest-billing', { params }),
  getServiceUsageReport: (params) => api.get('/admin/reports/service-usage', { params }),
  getMonthlyRevenueReport: (params) => api.get('/admin/reports/monthly-revenue', { params }),
  getTopServicesReport: (params) => api.get('/admin/reports/top-services', { params })
};

// Staff API calls
export const staffAPI = {
  getAvailableRooms: (params) => api.get('/staff/rooms/available', { params }),
  createGuest: (data) => api.post('/staff/guests', data),
  getGuests: () => api.get('/staff/guests'),
  createBooking: (data) => api.post('/staff/bookings', data),
  getBookings: () => api.get('/staff/bookings'),
  checkInBooking: (bookingId) => api.put(`/staff/bookings/${bookingId}/checkin`),
  checkOutBooking: (bookingId) => api.put(`/staff/bookings/${bookingId}/checkout`),
  cancelBooking: (bookingId) => api.put(`/staff/bookings/${bookingId}/cancel`),
  getServices: () => api.get('/staff/services'),
  addServiceUsage: (data) => api.post('/staff/services/usage', data),
  getServiceUsage: (bookingId) => api.get(`/staff/services/usage/${bookingId}`),
  generateBill: (bookingId, data) => api.post(`/staff/bills/${bookingId}`, data),
  getBills: () => api.get('/staff/bills'),
  processPayment: (data) => api.post('/staff/payments', data)
};

export default api;