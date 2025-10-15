/**
 * Admin Routes
 * Defines all admin-specific endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getRooms,
  getRoomTypes,
  getDesignations,
  // Report endpoints
  getRoomOccupancyReport,
  getGuestBillingSummary,
  getServiceUsageReport,
  getMonthlyRevenueReport,
  getTopServicesReport,
  getBranches
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// Apply auth middleware to all admin routes
router.use(authenticateToken);
router.use(requireAdmin);

// Dashboard routes
// @route   GET /api/admin/dashboard/stats
// @desc    Get dashboard overview statistics
// @access  Private (Admin only)
router.get('/dashboard/stats', getDashboardStats);

// Staff management routes
// @route   GET /api/admin/staff
// @desc    Get all staff members for admin's branch
// @access  Private (Admin only)
router.get('/staff', getStaff);

// @route   POST /api/admin/staff
// @desc    Create new staff member
// @access  Private (Admin only)
router.post('/staff', createStaff);

// @route   PUT /api/admin/staff/:staffId
// @desc    Update staff member
// @access  Private (Admin only)
router.put('/staff/:staffId', updateStaff);

// @route   DELETE /api/admin/staff/:staffId
// @desc    Delete staff member
// @access  Private (Admin only)
router.delete('/staff/:staffId', deleteStaff);

// Room management routes
// @route   GET /api/admin/rooms
// @desc    Get all rooms for admin's branch
// @access  Private (Admin only)
router.get('/rooms', getRooms);

// @route   GET /api/admin/room-types
// @desc    Get all room types
// @access  Private (Admin only)
router.get('/room-types', getRoomTypes);

// @route   GET /api/admin/designations
// @desc    Get all designations
// @access  Private (Admin only)
router.get('/designations', getDesignations);

// Report routes
// @route   GET /api/admin/reports/room-occupancy
// @desc    Get room occupancy report for selected date range
// @access  Private (Admin only)
router.get('/reports/room-occupancy', getRoomOccupancyReport);

// @route   GET /api/admin/reports/guest-billing
// @desc    Get guest billing summary including unpaid balances
// @access  Private (Admin only)
router.get('/reports/guest-billing', getGuestBillingSummary);

// @route   GET /api/admin/reports/service-usage
// @desc    Get service usage breakdown per room and service type
// @access  Private (Admin only)
router.get('/reports/service-usage', getServiceUsageReport);

// @route   GET /api/admin/reports/monthly-revenue
// @desc    Get monthly revenue per branch from room charges and services
// @access  Private (Admin only)
router.get('/reports/monthly-revenue', getMonthlyRevenueReport);

// @route   GET /api/admin/reports/top-services
// @desc    Get top-used services and customer preference trends
// @access  Private (Admin only)
router.get('/reports/top-services', getTopServicesReport);

// @route   GET /api/admin/branches
// @desc    Get all branches for report filtering
// @access  Private (Admin only)
router.get('/branches', getBranches);

module.exports = router;