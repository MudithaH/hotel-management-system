//handle staff routes

const express = require('express');
const {
  getAvailableRooms,
  createGuest,
  getGuests,
  updateGuest,
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

const router = express.Router();

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

// PUT /api/staff/guests/:guestId
router.put('/guests/:guestId', updateGuest);

// Booking management routes
// POST /api/staff/bookings
router.post('/bookings', createBooking);

// GET /api/staff/bookings
// Get all bookings for staff's branch
router.get('/bookings', getBookings);

// PUT /api/staff/bookings/:id/checkin
// Check-in a booking
router.put('/bookings/:bookingId/checkin', checkInBooking);

// PUT /api/staff/bookings/:id/checkout
// Check-out a booking
router.put('/bookings/:bookingId/checkout', checkOutBooking);

// PUT /api/staff/bookings/:id/cancel
// Cancel a booking
router.put('/bookings/:bookingId/cancel', cancelBooking);

// Service management routes
// GET /api/staff/services
// Get all available services
router.get('/services', getServices);

// POST /api/staff/services/usage
// Add service usage to booking
router.post('/services/usage', addServiceUsage);

// GET /api/staff/services/usage/:bookingId
// Get service usage details for booking
router.get('/services/usage/:bookingId', getServiceUsage);

// Billing routes
// POST /api/staff/bills/:bookingId
// Generate bill for booking
router.post('/bills/:bookingId', generateBill);

// GET /api/staff/bills
// Get all bills for staff's branch
router.get('/bills', getBills);

// Payment routes
// POST /api/staff/payments
// Process payment for a bill
router.post('/payments', processPayment);

module.exports = router;