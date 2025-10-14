/**
 * Admin Controller
 * Handles admin-specific operations: staff management, room management, etc.
 */

const { findMany, findOne, insertRecord, updateRecord, deleteRecord } = require('../config/db');
const { hashPassword, formatResponse, logAudit, isValidEmail, isValidPhone } = require('../utils/helpers');

// Get dashboard overview stats
const getDashboardStats = async (req, res) => {
  try {
    console.log('User Info:', req.user);
    const branchId = req.user.BranchID;

    // Get total bookings for the branch
    const bookingsQuery = `
      SELECT COUNT(*) as totalBookings
      FROM booking b
      JOIN bookingRooms br ON b.BookingID = br.BookingID
      JOIN room r ON br.RoomID = r.RoomID
      WHERE r.BranchID = ?
    `;

    // Get total revenue for the branch
    const revenueQuery = `
      SELECT COALESCE(SUM(bill.TotalAmount), 0) as totalRevenue
      FROM bill
      JOIN booking ON bill.BookingID = booking.BookingID
      JOIN bookingRooms br ON booking.BookingID = br.BookingID
      JOIN room r ON br.RoomID = r.RoomID
      WHERE r.BranchID = ?
    `;

    // Get total rooms for the branch
    const roomsQuery = `
      SELECT COUNT(*) as totalRooms,
             SUM(CASE WHEN Status = 'available' THEN 1 ELSE 0 END) as availableRooms,
             SUM(CASE WHEN Status = 'occupied' THEN 1 ELSE 0 END) as occupiedRooms
      FROM room
      WHERE BranchID = ?
    `;

    // Get total staff for the branch
    const staffQuery = `
      SELECT COUNT(*) as totalStaff
      FROM staff
      WHERE BranchID = ?
    `;

    const [bookingsResult, revenueResult, roomsResult, staffResult] = await Promise.all([
      findOne(bookingsQuery, [branchId]),
      findOne(revenueQuery, [branchId]),
      findOne(roomsQuery, [branchId]),
      findOne(staffQuery, [branchId])
    ]);


    const stats = {
      totalBookings: bookingsResult.data?.totalBookings || 0,
      totalRevenue: parseFloat(revenueResult.data?.totalRevenue || 0),
      totalRooms: roomsResult.data?.totalRooms || 0,
      availableRooms: roomsResult.data?.availableRooms || 0,
      occupiedRooms: roomsResult.data?.occupiedRooms || 0,
      totalStaff: staffResult.data?.totalStaff || 0
    };

    res.json(formatResponse(true, 'Dashboard stats retrieved successfully', stats));

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve dashboard stats', null, 500));
  }
};

// Get all staff members for admin's branch
const getStaff = async (req, res) => {
  try {
    const branchId = req.user.BranchID;

    const query = `
      SELECT s.StaffID, s.Name, s.Email, s.Phone, s.NIC, s.BranchID,
             s.DesignationID, d.Designation, d.Salary
      FROM staff s
      JOIN designation d ON s.DesignationID = d.DesignationID
      WHERE s.BranchID = ?
      ORDER BY s.Name
    `;

    const result = await findMany(query, [branchId]);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve staff', null, 500));
    }

    res.json(formatResponse(true, 'Staff retrieved successfully', result.data));

  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve staff', null, 500));
  }
};

// Create new staff member
const createStaff = async (req, res) => {
  try {
    const { name, email, phone, nic, password, designationId } = req.body;
    const branchId = req.user.BranchID;

    // Input validation
    if (!name || !email || !phone || !nic || !password || !designationId) {
      return res.status(400).json(formatResponse(false, 'All fields are required', null, 400));
    }

    if (!isValidEmail(email)) {
      return res.status(400).json(formatResponse(false, 'Invalid email format', null, 400));
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json(formatResponse(false, 'Invalid phone format', null, 400));
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Insert new staff member
    const query = `
      INSERT INTO staff (Name, Email, Phone, NIC, HashedPassword, BranchID, DesignationID)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const result = await insertRecord(query, [name, email, phone, nic, hashedPassword, branchId, designationId]);
    console.log('Insert Result1', result);
    if (!result.success) {
      console.log('Insert Resulterror2', result);
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }
      console.log('Insert Result3', result);

    
    // Log audit trail
    await logAudit(req.user.StaffID, 'staff', `CREATE - StaffID: ${result.insertId}`);

    res.status(201).json(formatResponse(true, 'Staff member created successfully', { staffId: result.insertId }));

  } catch (error) {
    console.error('Create staff error:', error);
    res.status(500).json(formatResponse(false, 'Failed to create staff member', null, 500));
  }
};

// Update staff member
const updateStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const { name, email, phone, nic, designationId } = req.body;
    const branchId = req.user.BranchID;
    console.log("req.param: ",req.params);
    console.log("req.body: ",req.body);
    console.log("req.user: ",req.user);
    // Verify staff belongs to same branch
    const checkQuery = 'SELECT StaffID FROM staff WHERE StaffID = ? AND BranchID = ?';
    const checkResult = await findOne(checkQuery, [staffId, branchId]);

    if (!checkResult.success || !checkResult.data) {
      return res.status(404).json(formatResponse(false, 'Staff member not found', null, 404));
    }

    // Input validation
    if (email && !isValidEmail(email)) {
      return res.status(400).json(formatResponse(false, 'Invalid email format', null, 400));
    }

    if (phone && !isValidPhone(phone)) {
      return res.status(400).json(formatResponse(false, 'Invalid phone format', null, 400));
    }

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (name) { updates.push('Name = ?'); values.push(name); }
    if (email) { updates.push('Email = ?'); values.push(email); }
    if (phone) { updates.push('Phone = ?'); values.push(phone); }
    if (nic) { updates.push('NIC = ?'); values.push(nic); }
    if (designationId) { updates.push('DesignationID = ?'); values.push(designationId); }

    if (updates.length === 0) {
      return res.status(400).json(formatResponse(false, 'No fields to update', null, 400));
    }

    values.push(staffId);
    const query = `UPDATE staff SET ${updates.join(', ')} WHERE StaffID = ?`;

    const result = await updateRecord(query, values);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'staff', `UPDATE - StaffID: ${staffId}`);

    res.json(formatResponse(true, 'Staff member updated successfully'));

  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json(formatResponse(false, 'Failed to update staff member', null, 500));
  }
};

// Delete staff member
const deleteStaff = async (req, res) => {
  try {
    const { staffId } = req.params;
    const branchId = req.user.BranchID;

    // Verify staff belongs to same branch and is not the current user
    const checkQuery = 'SELECT StaffID FROM staff WHERE StaffID = ? AND BranchID = ?';
    const checkResult = await findOne(checkQuery, [staffId, branchId]);

    if (!checkResult.success || !checkResult.data) {
      return res.status(404).json(formatResponse(false, 'Staff member not found', null, 404));
    }

    if (parseInt(staffId) === req.user.StaffID) {
      return res.status(400).json(formatResponse(false, 'Cannot delete your own account', null, 400));
    }

    const query = 'DELETE FROM staff WHERE StaffID = ?';
    const result = await deleteRecord(query, [staffId]);

    if (!result.success) {
      return res.status(400).json(formatResponse(false, result.error, null, 400));
    }

    // Log audit trail
    await logAudit(req.user.StaffID, 'staff', `DELETE - StaffID: ${staffId}`);

    res.json(formatResponse(true, 'Staff member deleted successfully'));

  } catch (error) {
    console.error('Delete staff error:', error);
    res.status(500).json(formatResponse(false, 'Failed to delete staff member', null, 500));
  }
};

// Get all rooms for admin's branch
const getRooms = async (req, res) => {
  try {
    const branchId = req.user.BranchID;

    const query = `
      SELECT r.RoomID, r.RoomNumber, r.Status, r.BranchID,
             rt.RoomTypeID, rt.TypeName, rt.Capacity, rt.DailyRate, rt.Amenities
      FROM room r
      JOIN roomType rt ON r.RoomTypeID = rt.RoomTypeID
      WHERE r.BranchID = ?
      ORDER BY r.RoomNumber
    `;

    const result = await findMany(query, [branchId]);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve rooms', null, 500));
    }

    res.json(formatResponse(true, 'Rooms retrieved successfully', result.data));

  } catch (error) {
    console.error('Get rooms error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve rooms', null, 500));
  }
};

// Get all room types
const getRoomTypes = async (req, res) => {
  try {
    const query = 'SELECT * FROM roomType ORDER BY TypeName';
    const result = await findMany(query);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve room types', null, 500));
    }

    res.json(formatResponse(true, 'Room types retrieved successfully', result.data));

  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve room types', null, 500));
  }
};

// Get all designations
const getDesignations = async (req, res) => {
  try {
    const query = 'SELECT * FROM designation ORDER BY Designation';
    const result = await findMany(query);

    if (!result.success) {
      return res.status(500).json(formatResponse(false, 'Failed to retrieve designations', null, 500));
    }

    res.json(formatResponse(true, 'Designations retrieved successfully', result.data));

  } catch (error) {
    console.error('Get designations error:', error);
    res.status(500).json(formatResponse(false, 'Failed to retrieve designations', null, 500));
  }
};

module.exports = {
  getDashboardStats,
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  getRooms,
  getRoomTypes,
  getDesignations
};