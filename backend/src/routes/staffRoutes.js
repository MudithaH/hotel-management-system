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
  checkInBooking,
  checkOutBooking,
  getServices,
  addServiceUsage,
  getServiceUsage,
  generateBill,
  getBills,
  processPayment,
  cancelBooking
} = require('../controllers/staffController');
const { authenticateToken, requireStaff } = require('../middleware/authMiddleware');

// Apply auth middleware to all staff routes
router.use(authenticateToken);
router.use(requireStaff);

// Room availability routes
//  GET /api/staff/rooms/available
router.get('/rooms/available', getAvailableRooms);

// Guest management routes
//  POST /api/staff/guests
router.post('/guests', createGuest);

// GET /api/staff/guests
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

// @route   PUT /api/staff/bookings/:id/checkin
// @desc    Check-in a booking
// @access  Private (Staff/Admin)
router.put('/bookings/:bookingId/checkin', checkInBooking);

// @route   PUT /api/staff/bookings/:id/checkout
// @desc    Check-out a booking
// @access  Private (Staff/Admin)
router.put('/bookings/:bookingId/checkout', checkOutBooking);

// @route   PUT /api/staff/bookings/:id/cancel
// @desc    Cancel a booking
// @access  Private (Staff/Admin)
router.put('/bookings/:bookingId/cancel', cancelBooking);

// Service management routes
// @route   GET /api/staff/services
// @desc    Get all available services
// @access  Private (Staff/Admin)
router.get('/services', getServices);

// @route   POST /api/staff/services/usage
// @desc    Add service usage to booking
// @access  Private (Staff/Admin)
router.post('/services/usage', addServiceUsage);

// @route   GET /api/staff/services/usage/:bookingId
// @desc    Get service usage details for booking
// @access  Private (Staff/Admin)
router.get('/services/usage/:bookingId', getServiceUsage);

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