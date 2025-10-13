/**
 * Staff Routes
 * Defines all staff-specific endpoints
 */

const express = require('express');
const router = express.Router();
const {
  getAvailableRooms,
  createGuest,
  getGuests,
  createBooking,
  getBookings,
  getServices,
  addServiceUsage,
  generateBill,
  getBills,
  processPayment
} = require('../controllers/staffController');
const { authenticateToken, requireStaff } = require('../middleware/authMiddleware');

// Apply auth middleware to all staff routes
router.use(authenticateToken);
router.use(requireStaff);

// Room availability routes
// @route   GET /api/staff/rooms/available
// @desc    Get available rooms for booking (with date conflict check)
// @access  Private (Staff/Admin)
router.get('/rooms/available', getAvailableRooms);

// Guest management routes
// @route   POST /api/staff/guests
// @desc    Create new guest
// @access  Private (Staff/Admin)
router.post('/guests', createGuest);

// @route   GET /api/staff/guests
// @desc    Get all guests
// @access  Private (Staff/Admin)
router.get('/guests', getGuests);

// Booking management routes
// @route   POST /api/staff/bookings
// @desc    Create new booking
// @access  Private (Staff/Admin)
router.post('/bookings', createBooking);

// @route   GET /api/staff/bookings
// @desc    Get all bookings for staff's branch
// @access  Private (Staff/Admin)
router.get('/bookings', getBookings);

// Service management routes
// @route   GET /api/staff/services
// @desc    Get all available services
// @access  Private (Staff/Admin)
router.get('/services', getServices);

// @route   POST /api/staff/services/usage
// @desc    Add service usage to booking
// @access  Private (Staff/Admin)
router.post('/services/usage', addServiceUsage);

// Billing routes
// @route   POST /api/staff/bills/:bookingId
// @desc    Generate bill for booking
// @access  Private (Staff/Admin)
router.post('/bills/:bookingId', generateBill);

// @route   GET /api/staff/bills
// @desc    Get all bills for staff's branch
// @access  Private (Staff/Admin)
router.get('/bills', getBills);

// Payment routes
// @route   POST /api/staff/payments
// @desc    Process payment for a bill
// @access  Private (Staff/Admin)
router.post('/payments', processPayment);

module.exports = router;