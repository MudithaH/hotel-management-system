// // handle admin routes

// const express = require('express');
// const {
// 	getDashboardStats,
// 	getStaff,
// 	createStaff,
// 	updateStaff,
// 	deleteStaff,
// 	getRooms,
// 	getRoomTypes,
// 	getDesignations,
// 	getBranches,
// 	// Reports
// 	getRoomOccupancyReport,
// 	getGuestBillingSummary,
// 	getServiceUsageReport,
// 	getMonthlyRevenueReport,
// 	getTopServicesReport
// } = require('../controllers/adminController');

// const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');

// const router = express.Router();

// // Protect all admin routes
// router.use(authenticateToken);
// router.use(requireAdmin);

// // Dashboard
// // GET /api/admin/dashboard/stats
// router.get('/dashboard/stats', getDashboardStats);

// // Staff management
// // GET /api/admin/staff
// router.get('/staff', getStaff);
// // POST /api/admin/staff
// router.post('/staff', createStaff);
// // PUT /api/admin/staff/:staffId
// router.put('/staff/:staffId', updateStaff);
// // DELETE /api/admin/staff/:staffId
// router.delete('/staff/:staffId', deleteStaff);

// // Room and reference data
// // GET /api/admin/rooms
// router.get('/rooms', getRooms);
// // GET /api/admin/room-types
// router.get('/room-types', getRoomTypes);
// // GET /api/admin/designations
// router.get('/designations', getDesignations);
// // GET /api/admin/branches
// router.get('/branches', getBranches);

// // Reports
// // GET /api/admin/reports/room-occupancy
// router.get('/reports/room-occupancy', getRoomOccupancyReport);
// // GET /api/admin/reports/guest-billing
// router.get('/reports/guest-billing', getGuestBillingSummary);
// // GET /api/admin/reports/service-usage
// router.get('/reports/service-usage', getServiceUsageReport);
// // GET /api/admin/reports/monthly-revenue
// router.get('/reports/monthly-revenue', getMonthlyRevenueReport);
// // GET /api/admin/reports/top-services
// router.get('/reports/top-services', getTopServicesReport);

// module.exports = router;

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


router.get('/dashboard/stats', getDashboardStats);

// Staff management routes
router.get('/staff', getStaff);

// POST /api/admin/staff

router.post('/staff', createStaff);

// PUT /api/admin/staff/:staffId

router.put('/staff/:staffId', updateStaff);

// DELETE /api/admin/staff/:staffId
// Delete staff member
router.delete('/staff/:staffId', deleteStaff);

// Room management routes

router.get('/rooms', getRooms);


router.get('/room-types', getRoomTypes);

// GET /api/admin/designations
// Get all designations
router.get('/designations', getDesignations);


router.get('/reports/room-occupancy', getRoomOccupancyReport);

// GET /api/admin/reports/guest-billing
// Get guest billing summary including unpaid balances
router.get('/reports/guest-billing', getGuestBillingSummary);

// GET /api/admin/reports/service-usage
// Get service usage breakdown per room and service type
router.get('/reports/service-usage', getServiceUsageReport);


router.get('/reports/monthly-revenue', getMonthlyRevenueReport);


router.get('/reports/top-services', getTopServicesReport);

// GET /api/admin/branches
// Get all branches for report filtering
router.get('/branches', getBranches);

module.exports = router;