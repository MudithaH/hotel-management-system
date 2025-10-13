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
  getDesignations
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

module.exports = router;