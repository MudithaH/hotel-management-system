//handle admin routes

const express = require('express');
const {
  getDashboardStats,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getRooms,
  getRoomTypes,
  getDesignations,
  getRoomOccupancyReport,
  getGuestBillingSummary,
  getServiceUsageReport,
  getMonthlyRevenueReport,
  getTopServicesReport,
  getBranches
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
// GET /api/admin/dashboard/stats
// Get dashboard overview statistics
router.get('/dashboard/stats', getDashboardStats);

// Staff management routes
// GET /api/admin/staff
// Get all staff members for admin's branch
router.get('/staff', getStaff);

// POST /api/admin/staff
// Create new staff member
router.post('/staff', createStaff);

// PUT /api/admin/staff/:staffId
// Update staff member
router.put('/staff/:staffId', updateStaff);

// DELETE /api/admin/staff/:staffId
// Delete staff member
router.delete('/staff/:staffId', deleteStaff);

// Room management routes
// GET /api/admin/rooms
// Get all rooms for admin's branch
router.get('/rooms', getRooms);

// GET /api/admin/room-types
// Get all room types
router.get('/room-types', getRoomTypes);

// GET /api/admin/designations
// Get all designations
router.get('/designations', getDesignations);

// Report routes
// GET /api/admin/reports/room-occupancy
// Get room occupancy report for selected date range
router.get('/reports/room-occupancy', getRoomOccupancyReport);

// GET /api/admin/reports/guest-billing
// Get guest billing summary including unpaid balances
router.get('/reports/guest-billing', getGuestBillingSummary);

// GET /api/admin/reports/service-usage
// Get service usage breakdown per room and service type
router.get('/reports/service-usage', getServiceUsageReport);

// GET /api/admin/reports/monthly-revenue
// Get monthly revenue per branch from room charges and services
router.get('/reports/monthly-revenue', getMonthlyRevenueReport);

// GET /api/admin/reports/top-services
// Get top-used services and customer preference trends
router.get('/reports/top-services', getTopServicesReport);

// GET /api/admin/branches
// Get all branches for report filtering
router.get('/branches', getBranches);

module.exports = router;